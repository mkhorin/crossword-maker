/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado/component/utility/MetaUtility');

module.exports = class ImportWordsUtility extends Base {

    static CLUE_SEPARATOR = ';';

    async execute () {
        const request = this.postParams;
        const items = request.words;
        if (!Array.isArray(items)) {
            throw new BadRequest('Invalid word format');
        }
        const metaParams = await this.resolveMetaParams();
        const meta = metaParams.class.meta;
        this.languageClass = meta.getClass('language');
        this.themeClass = meta.getClass('theme');
        this.wordClass = meta.getClass('word');
        this.wordToThemeClass = meta.getClass('wordToTheme');
        this.clueClass = meta.getClass('clue');
        this.clueToThemeClass = meta.getClass('clueToTheme');
        this.language = await this.resolveLanguageId(request.language);
        this.theme = request.theme
            ? await this.resolveThemeId(request.theme)
            : null;
        this.skipNewWords = request.skipNewWords;
        for (const item of items) {
            await this.processItem(item);
        }
        this.controller.sendText('Word import is done');
    }

    async resolveLanguageId (id) {
        const language = await this.languageClass.findById(id).id();
        if (language) {
            return language;
        }
        throw new BadRequest('Language not found');
    }

    async resolveThemeId (id) {
        const theme = await this.themeClass.findById(id).id();
        if (theme) {
            return theme;
        }
        throw new BadRequest('Theme not found');
    }

    async processItem (data) {
        if (typeof data !== 'string') {
            throw new BadRequest('Invalid data');
        }
        try {
            const [word, ...clues] = data.split(this.constructor.CLUE_SEPARATOR);
            const id = await this.resolveWordId(word);
            if (id) {
                await this.linkToTheme(this.wordToThemeClass, this.wordClass, {word: id});
                await this.resolveClues(clues, id);
            }
        } catch (err) {
            this.log('error', err?.message, {data});
        }
    }

    async resolveWordId (word) {
        const data = {
            value: word.trim().toLowerCase(),
            language: this.language
        };
        const id = await this.wordClass.find(data).id();
        if (id) {
            return id;
        }
        if (!this.skipNewWords) {
            const model = await this.createAndSave(this.wordClass, data);
            return model.getId();
        }
    }

    async resolveClues (values, word) {
        for (let value of values) {
            value = value.trim();
            if (value) {
                const id = await this.resolveClue(value, word);
                await this.linkToTheme(this.clueToThemeClass, this.clueClass, {clue: id});
            }
        }
    }

    async resolveClue (value, word) {
        const data = {value, word};
        const id = await this.clueClass.find(data).id();
        if (id) {
          return id;
        }
        data.words = word;
        const model = await this.createAndSave(this.clueClass, {value, word});
        return model.getId();
    }

    async linkToTheme (linkClass, targetClass, data) {
        if (this.theme) {
            const themes = await linkClass.find(data).column('theme');
            if (!MongoHelper.includes(this.theme, themes)) {
                data.theme = this.theme;
                await this.createAndSave(linkClass, data);
            }
        }
    }

    async createAndSave (Class, data) {
        const model = await this.createModel(Class);
        debugger;
        model.load(data);
        if (await model.save()) {
            return model;
        }
        throw new Error(model.getFirstError());
    }
};

const BadRequest = require('areto/error/http/BadRequest');
const MongoHelper = require('areto/helper/MongoHelper');