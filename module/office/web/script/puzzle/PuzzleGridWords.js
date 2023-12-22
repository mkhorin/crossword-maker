/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleGridWords {

    static SELECT_WORD_EVENT = 'selectWord';

    constructor ($container, puzzle) {
        this.puzzle = puzzle;
        this.events = new Jam.Events(this.constructor.name);
        this.$container = $container;
    }

    init () {
        this.grid = this.puzzle.grid;
        this.clues = this.puzzle.clues;
        this.puzzle.events.on(Puzzle.CHANGE_MODE_EVENT, this.onChangeMode.bind(this));
        this.$container.on('click', '.puzzle-word', this.onSelectWord.bind(this));
    }

    onChangeMode () {
        if (this.puzzle.isClueMode()) {
            this.clueFilter = null;
            this.draw();
            const word = this.grid.getSelectedBlock()?.word;
            this.selectByElement(this.getElementByWord(word));
        }
    }

    onChangeTheme () {

    }

    onSelectWord ({target}) {
        const {word} = target.dataset;
        this.selectByElement($(target));
    }

    getElementByWord (word) {
        return this.$container.children(`[data-word="${word}"]`);
    }

    getSelectedWord () {
        return this.getSelectedElement().data('word');
    }

    getSelectedElement () {
        return this.$container.children('.selected');
    }

    selectByElement ($item) {
        this.deselect();
        $item.toggleClass('selected');
        this.triggerSelect();
    }

    deselect () {
        this.getSelectedElement().removeClass('selected');
        this.triggerSelect();
    }

    draw () {
        this.deselect();
        const words = this.getWords();
        words.sort((a, b) => a.localeCompare(b));
        const items = words.map(this.drawItem, this);
        this.$container.html(items.join(''));
    }

    drawItem (word) {
        return `<div class="puzzle-word" data-word="${word}">${word}</div>`;
    }

    getWords () {
        let words = this.grid.getWords();
        if (this.clueFilter) {
            words = words.filter(this.clueFilter);
        }
        return words;
    }

    setAnyClueFilter () {
        this.clueFilter = null;
        this.draw();
    }

    setMultipleClueFilter () {
        this.clueFilter = this.clues.filterMultipleClue.bind(this.clues);
        this.draw();
    }

    setUnselectedClueFilter () {
        this.clueFilter = this.clues.filterUnselectedClue.bind(this.clues);
        this.draw();
    }

    setWithoutClueFilter () {
        this.clueFilter = this.clues.filterWithoutClue.bind(this.clues);
        this.draw();
    }

    triggerSelect () {
        const word = this.getSelectedWord();
        this.events.trigger(this.constructor.SELECT_WORD_EVENT, {word});
    }
}