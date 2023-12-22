/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleDictionary {

    static MAX_DISPLAY_WORDS = 100;
    static WORD_SELECT_EVENT = 'wordSelect';

    static getValuedPositionss (items) {
        let positions = [];
        for (let i = 0; i < items.length; ++i) {
            if (items[i]) {
                positions.push(i);
            }
        }
        return positions;
    }

    constructor ($container, puzzle) {
        this.puzzle = puzzle;
        this.grid = puzzle.grid;
        this.$container = $container;
        this.$search = $container.find('[type="search"]');
        this.$words = $container.find('.puzzle-dictionary-words');
        this.events = new Jam.Events(this.constructor.name);
        this.provider = new PuzzleWordProvider(this.puzzle);
    }

    init () {
        this.grid.events.on(PuzzleGrid.BLOCK_SELECT_EVENT, this.onSelectBlock.bind(this));
        this.grid.events.on(PuzzleGrid.WORD_SELECT_EVENT, this.onSelectBlockWord.bind(this));
        this.$search.on('input', this.onSearch.bind(this));
        this.$words.on('click', 'div', this.onSelectWord.bind(this));
        this.provider.events.on(PuzzleWordProvider.UPDATE_EVENT, this.onUpdateProvider.bind(this));
        this.provider.init();
    }

    onSearch () {
        this.update();
    }

    onSelectWord ({target}) {
        this.selectByElement($(target));
        const {word} = target.dataset;
        this.events.trigger(this.constructor.WORD_SELECT_EVENT, {word});
    }

    onSelectBlock () {
        this.update();
    }

    onSelectBlockWord () {
        const block = this.grid.getSelectedBlock();
        if (block && !block.word) {
            this.update();
        }
    }

    onUpdateProvider () {
        this.update();
    }

    getElementByWord (word) {
        return this.$words.children(`[data-word="${word}"]`);
    }

    update () {
        this.clearWords();
        const block = this.grid.getSelectedBlock();
        if (!block) {
            return;
        }
        const words = this.getBlockWords(block);
        const displayWords = this.limitMaxWords(words, block);
        this.drawWords(displayWords);
        if (block.word) {
            const $word = this.getElementByWord(block.word);
            this.selectByElement($word);
            this.scrollToElement($word);
        }
    }

    selectByElement ($item) {
        this.deselect();
        $item.toggleClass('selected');
    }

    deselect () {
        this.$words.children('.selected').removeClass('selected');
    }

    scrollToElement ($word) {
        Jam.ScrollHelper.scrollTo($word, this.$words, 0);
    }

    getBlockWords (block) {
        const size = block.getSize();
        const words = this.provider.getBySize(size);
        const letters = block.getCrossLetters();
        const positions = this.constructor.getValuedPositionss(letters);
        const blockWords = this.grid.getWords(block.word);
        const usedWords = Jam.ArrayHelper.flip(blockWords);
        const search = $.trim(this.$search.val()).toLowerCase();
        const result = [];
        for (const word of words) {
            if (!usedWords.hasOwnProperty(word)) {
                if (!search || word.startsWith(search)) {
                    if (this.filterWordByLetters(word, positions, letters)) {
                        result.push(word);
                    }
                }
            }
        }
        return result;
    }

    limitMaxWords (words, {word}) {
        let max = this.constructor.MAX_DISPLAY_WORDS;
        let counter = words.length;
        if (counter <= max) {
            return words;
        }
        if (!word) {
            return words.slice(0, max);
        }
        let index = words.indexOf(word);
        let start = index - max / 2;
        let end = index + max / 2;
        if (start < 0) {
            end -= start;
            start = 0;
        }
        if (end > counter) {
            start -= end - counter;
            end = counter;
        }
        return words.slice(start, end);
    }

    filterWordByLetters (word, positions, letters) {
        for (const pos of positions) {
            if (word[pos] !== letters[pos]) {
                return false;
            }
        }
        return true;
    }

    clearWords () {
        this.$words.empty();
    }

    drawWords (words) {
        let list = '';
        for (let word of words) {
            list += this.drawWord(word);
        }
        this.$words.html(list);
    }

    drawWord (word) {
        return `<div class="puzzle-dictionary-word" data-word="${word}">${word}</div>`;
    }

    resize () {
        const h = this.grid.$container.parent().outerHeight();
        this.$container.height(h);
    }
}