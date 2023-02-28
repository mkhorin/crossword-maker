/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class Puzzle {

    static CLASSIC_TYPE = 'classic';
    static SCAN_TYPE = 'scan';

    static GRID_MODE = 'grid';
    static CLUE_MODE = 'clues';

    static CHANGE_EVENT = 'change';
    static CHANGE_LANGUAGE_EVENT = 'changeLanguage';
    static CHANGE_THEME_EVENT = 'changeTheme';
    static CHANGE_MODE_EVENT = 'changeMode';

    constructor ($container, data, title) {
        this.$container = $container;
        this.data = data;
        this.title = title;
        this.events = new Jam.Events(this.constructor.name);
        this.alert = this.createAlert();
        this.grid = this.createGrid();
        this.toolbar = this.createToolbar();
        this.dictionary = this.createDictionary();
        this.clues = this.createClues();
        this.gridWords = this.createGridWords();
        this.clueNotification = this.createClueNotification();
        this.solver = this.createSolver();
        this.generator = this.createGenerator();
    }

    init () {
        this.grid.init();
        this.toolbar.init();
        this.dictionary.init();
        this.clues.init();
        this.gridWords.init();
        this.clueNotification.init();
    }

    getWordsUrl (language) {
        return `${this.$container.data('wordDir')}/${language}.json`;
    }

    createAlert () {
        return new Jam.Alert({
            container: this.$container
        });
    }

    createToolbar () {
        const $element = this.$container.find('.puzzle-toolbar');
        return new PuzzleToolbar($element, this);
    }

    createGrid () {
        const $element = this.$container.find('.puzzle-grid');
        return new PuzzleGrid($element, this);
    }

    createDictionary () {
        const $element = this.$container.find('.puzzle-dictionary');
        return new PuzzleDictionary($element, this);
    }

    createClues () {
        const $element = this.$container.find('.puzzle-clues');
        return new PuzzleClues($element, this);
    }

    createGridWords () {
        const $element = this.$container.find('.puzzle-grid-words');
        return new PuzzleGridWords($element, this);
    }

    createClueNotification () {
        const $element = this.$container.find('.puzzle-clue-notification');
        return new PuzzleClueNotification($element, this);
    }

    createSolver () {
        return new PuzzleSolver(this);
    }

    createGenerator () {
        return new PuzzleGenerator(this);
    }

    setLanguage (id, code) {
        this.abortSolver();
        this.languageId = id;
        this.languageCode = code;
        this.trigger(Puzzle.CHANGE_LANGUAGE_EVENT, {id, code});
    }

    setTheme (id, name) {
        this.abortSolver();
        this.themeId = id;
        this.themeName = name;
        this.trigger(Puzzle.CHANGE_THEME_EVENT, {id, name});
    }

    setType (type) {
        switch (type) {
            case 'scan': {
                this.setScanType();
                break;
            }
            default: {
                this.setClassicType();
            }
        }
        this.setMode(Puzzle.GRID_MODE);
    }

    setClassicType () {
        this.grid.setClassicType();
        this.$container.attr('data-type', Puzzle.CLASSIC_TYPE);
    }

    setScanType () {
        this.grid.setScanType();
        this.$container.attr('data-type', Puzzle.SCAN_TYPE);
    }

    isGridMode () {
        return this.getMode() === this.constructor.GRID_MODE;
    }

    isClueMode () {
        return this.getMode() === this.constructor.CLUE_MODE;
    }

    getMode () {
        return this.$container.attr('data-mode');
    }

    setMode (mode) {
        this.$container.attr('data-mode', mode);
        this.trigger(Puzzle.CHANGE_MODE_EVENT, {mode});
    }

    getTemplate (id) {
        return this.$container.find(`template[data-id="${id}"]`);
    }

    clear () {
        this.abortSolver();
        this.abortGenerator();
        this.grid.clear();
    }

    onClose () {
        this.abortSolver();
        this.abortGenerator();
    }

    onResize () {
        this.abortSolver();
        this.abortGenerator();
        this.grid.onResize(...arguments);
        this.dictionary.resize();
    }

    abortSolver () {
        this.solver.abort();
    }

    abortGenerator () {
        this.generator.abort();
    }

    exportData () {
        return this.grid.exportData();
    }

    triggerChange () {
        return this.trigger(Puzzle.CHANGE_EVENT, ...arguments);
    }

    trigger () {
        return this.events.trigger(...arguments);
    }
}