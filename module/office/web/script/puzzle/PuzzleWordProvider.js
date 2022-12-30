/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleWordProvider {

    static UPDATE_EVENT = 'update';

    constructor (puzzle) {
        this.puzzle = puzzle;
        this.data = {};
        this.events = new Jam.Events(this.constructor.name);
    }

    init () {
        this.puzzle.events.on(Puzzle.CHANGE_LANGUAGE_EVENT, this.onChangeLanguage.bind(this));
        this.puzzle.events.on(Puzzle.CHANGE_THEME_EVENT, this.onChangeTheme.bind(this));
    }

    isLoaded (language) {
        return this.data.hasOwnProperty(language);
    }

    getByLetter (letter, position, size) {
        return this.getData()?.[size]?.[position]?.[letter] || [];
    }

    getByPosition (position, size) {
        return this.getData()?.[size]?.[position] || {};
    }

    getBySize (size) {
        return this.getData()?.[size]?.all || [];
    }

    getData () {
        const language = this.puzzle.languageCode;
        if (!this.isLoaded(language)) {
            return null;
        }
        const {words, themes} = this.data[language];
        const theme = this.puzzle.themeName;
        if (!theme) {
            return words;
        }
        return themes.hasOwnProperty(theme) ? themes[theme] : {};
    }

    onChangeLanguage (event, {code}) {
        if (!code || this.isLoaded(code)) {
            return this.triggerUpdate();
        }
        this.load(code).done(() => this.triggerUpdate());
    }

    onChangeTheme () {
        this.triggerUpdate();
    }

    triggerUpdate () {
        this.events.trigger(this.constructor.UPDATE_EVENT);
    }

    load (language) {
        const url = this.puzzle.getWordsUrl(language);
        //Jam.showLoader();
        return $.get(url)
            .done(this.onLoad.bind(this, language))
            .always(() => Jam.hideLoader());
    }

    onLoad (language, data) {
        this.data[language] = this.prepareWords(data);
    }

    prepareWords (data) {
        const words = this.indexWords(data.words);
        const themes = {};
        for (const {name, words} of data.themes) {
            themes[name] = this.indexWords(words);
        }
        return {words, themes};
    }

    indexWords (words) {
        const result = {};
        for (const word of words) {
            const size = word.length;
            if (!result[size]) {
                result[size] = {all: []};
            }
            let positions = result[size];
            for (let i = 0; i < size; ++i) {
                if (!positions[i]) {
                    positions[i] = {};
                }
                let letters = positions[i];
                let char = word[i];
                if (!letters[char]) {
                    letters[char] = [];
                }
                letters[char].push(word);
            }
            positions.all.push(word);
        }
        return result;
    }
}