/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleClues {

    static PROCESS_WORD_DELAY = 500;

    static getSelectedClue (clues) {
        return clues?.find(clue => clue.selected);
    }

    constructor ($container, puzzle) {
        this.puzzle = puzzle;
        this.clues = [];
        this.clueMap = {};
        this.wordMap = {};
        this.newWords = [];
        this.processWordsTimer = null;
        this.loading = false;
        this.events = new Jam.Events(this.constructor.name);
        this.processWords = this.processWords.bind(this);
        this.$container = $container;
    }

    init () {
        this.grid = this.puzzle.grid;
        this.gridWords = this.puzzle.gridWords;
        this.provider = new PuzzleClueProvider(this);

        this.puzzle.events.on(Puzzle.CHANGE_THEME_EVENT, this.onChangeTheme.bind(this));
        this.puzzle.events.on(Puzzle.CHANGE_MODE_EVENT, this.onChangeMode.bind(this));
        this.gridWords.events.on(PuzzleGridWords.SELECT_WORD_EVENT, this.onSelectWord.bind(this));

        this.$container.on('click', '.puzzle-clue', this.onSelectClue.bind(this));
    }

    onChangeTheme () {
        this.reload();
    }

    onChangeMode () {
        if (this.puzzle.isClueMode()) {
            this.grid.getWords().forEach(this.addNewWord, this);
            this.processWords();
        }
    }

    onSelectClue ({target}) {
        const clue = this.getClueById(target.dataset.id);
        this.selectClue(clue, !clue.selected);
        this.draw();
        this.puzzle.triggerChange();
    }

    onSelectWord () {
        this.draw();
    }

    getSelectedClueByWord (word) {
        const clues = this.getWordClues(word);
        return clues
            ? this.constructor.getSelectedClue(clues) || false
            : null;
    }

    getSelectedClue () {
        const id = this.getSelectedElement().data('id');
        return this.getClueById(id);
    }

    getSelectedElement () {
        return this.$container.children('.selected');
    }

    getWordClues (word) {
        return Object.hasOwn(this.clueMap, word)
            ? this.clueMap[word]
            : null;
    }

    getClueById (id) {
        for (const clue of this.clues) {
            if (clue._id === id) {
                return clue;
            }
        }
    }

    selectClue (clue, state = true) {
        this.deselectWordClues(clue.word.value);
        clue.selected = state;
    }

    deselectWordClues (word) {
        const clues = this.getWordClues(word);
        for (const clue of clues) {
            clue.selected = false;
        }
    }

    addNewWord (word) {
        if (!this.getWordClues(word)) {
            if (!this.newWords.includes(word)) {
                this.newWords.push(word);
            }
        }
    }

    addClue (data) {
        this.clues.push(data);
        this.addClueToMap(data, data.word.value);
    }

    addClueToMap (clue, word) {
        this.clueMap[word].push(clue);
    }

    removeClue (clue) {
        Jam.ArrayHelper.remove(clue, this.clues);
        for (const wordClues of Object.values(this.clueMap)) {
            Jam.ArrayHelper.remove(clue, wordClues);
        }
    }

    processWords () {
        clearTimeout(this.processWordsTimer);
        this.load(this.newWords);
        this.startProcessWords();
    }

    startProcessWords () {
        clearTimeout(this.processWordsTimer);
        this.processWordsTimer = setTimeout(this.processWords, this.constructor.PROCESS_WORD_DELAY);
    }

    loadByWord (word) {
        this.addNewWord(word);
        this.processWords();
    }

    async reload () {
        if (!this.loading) {
            this.clues = [];
            this.clueMap = {};
            this.grid.getWords().forEach(this.addNewWord, this);
            this.processWords();
        }
    }

    async load (words) {
        if (this.loading || !words.length) {
            return false;
        }
        for (const word of words) {
            this.clueMap[word] = [];
        }
        const neededWords = [...words];
        words.length = 0;
        this.loading = true;
        const data = await this.provider.list(neededWords);
        this.parseWords(data?.words);
        this.parseClues(data?.clues);
        this.loading = false;
        if (this.puzzle.isClueMode()) {
            this.draw();
        }
        this.triggerChange();
        this.processWords();
    }

    parseWords (items) {
        if (Array.isArray(items)) {
            for (const {_id, value} of items) {
                this.wordMap[value] = _id;
            }
        }
    }

    parseClues (items) {
        if (Array.isArray(items)) {
            for (const item of items) {
                this.addClue(item);
                const id = this.grid.getClueByWord(item.word.value);
                item.selected = item._id === id;
            }
        }
    }

    draw () {
        const word = this.gridWords.getSelectedWord();
        if (!word) {
            return this.$container.html('');
        }
        const clues = this.getWordClues(word);
        const items = clues.map(this.drawItem, this);
        this.$container.html(items.join(''));
    }

    drawItem ({_id, value, selected}) {
        return `<div class="puzzle-clue ${selected ? 'selected' : ''}" data-id="${_id}">${value}</div>`;
    }

    async create (word) {
        const value = this.inputValue('Input a new clue');
        if (!value) {
            return;
        }
        const _id = await this.provider.create({
            word: this.wordMap[word],
            value
        });
        if (_id) {
            await this.provider.linkToTheme(_id);
            word = {value: word};
            const data = {_id, word, value};
            this.addClue(data);
            this.selectClue(data);
            this.draw();
        }
    }

    async edit (clue) {
        const value = this.inputValue('Input a new clue', clue.value);
        if (!value || value === clue.value) {
            return;
        }
        if (await this.provider.update(clue._id, {value})) {
            clue.value = value;
            this.draw();
        }
    }

    async delete (clue) {
        if (await this.provider.delete(clue._id)) {
            this.removeClue(clue);
            this.draw();
        }
    }

    inputValue (title, source) {
        const value = prompt(Jam.t(title), source);
        if (value === null) {
            return null;
        }
        const result = this.validate(value);
        if (result === true) {
            return value;
        }
        this.puzzle.alert.danger(result || 'Invalid clue');
    }

    validate (value) {
        value = $.trim(value);
        if (value.length === 0) {
            return false;
        }
        if (!this.validateUniqueValue(value)) {
            return 'This clue already exists';
        }
        return true;
    }

    validateUniqueValue (value) {
        const word = this.gridWords.getSelectedWord();
        const clues = this.getWordClues(word);
        for (const clue of clues) {
            if (clue.value === value) {
                return false;
            }
        }
        return true;
    }

    filterMultipleClue (word) {
        const clues = this.getWordClues(word);
        return clues?.length > 1;
    }

    filterUnselectedClue (word) {
        const clues = this.getWordClues(word);
        if (!clues || clues.length < 2) {
            return false;
        }
        for (const clue of clues) {
            if (clue.selected) {
                return false;
            }
        }
        return true;
    }

    filterWithoutClue (word) {
        const clues = this.getWordClues(word);
        return clues?.length === 0;
    }

    triggerChange () {
        this.events.trigger(this.constructor.EVENT_CHANGE, ...arguments);
    }
}