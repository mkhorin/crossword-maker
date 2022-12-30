/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado/component/utility/MetaUtility');

module.exports = class ExportWordsUtility extends Base {

    async execute () {
        const request = this.postParams;
        const metaParams = await this.resolveMetaParams();

        this.meta = metaParams.class.meta;
        this.language = await this.resolveLanguage(request.language);
        this.themeMap = await this.getThemeMap();
        this.wordThemeMap = await this.getWordThemeMap();

        const words = await this.getWords();
        const themes = Object
            .values(this.themeMap)
            .map(({name, words}) => ({name, words}))
            .filter(({words}) => words.length);
        const file = this.language.get('code');

        await this.createFile(file, {words, themes});
        this.controller.sendText('Word export is done');
    }

    async resolveLanguage (id) {
        const language = await this.meta.getClass('language').findById(id).one();
        if (language) {
            return language;
        }
        throw new BadRequest('Language not found');
    }

    async getThemeMap () {
        const map = await this.meta.getClass('theme').find().raw().indexByKey().all();
        for (const theme of Object.values(map)) {
            theme.words = [];
        }
        return map;
    }

    async getWordThemeMap () {
        const links = await this.meta.getClass('wordToTheme').find().raw().all();
        return IndexHelper.indexObjects(links, 'word', 'theme');
    }

    async getWords () {
        const result = [];
        const language = this.language.getId();
        const words = await this.meta.getClass('word').find({language}).raw().all();
        for (const word of words) {
            this.addWordToThemes(word);
            result.push(word.value);
        }
        return result;
    }

    addWordToThemes (word) {
        const themes = this.wordThemeMap[word._id];
        if (Array.isArray(themes)) {
            for (const theme of themes) {
                this.addWordToTheme(theme, word);
            }
        } else if (themes) {
            this.addWordToTheme(themes, word);
        }
    }

    addWordToTheme (theme, word) {
        this.themeMap[theme]?.words.push(word.value);
    }

    async createFile (name, data) {
        const dir =this.getWordDir();
        await FileHelper.createDirectory(dir);
        const file = path.join(dir, `${name}.json`);
        const text = JSON.stringify(data, null, 1);
        await fs.promises.writeFile(file, text);
    }

    getWordDir () {
        const {app} = this.module;
        return path.join(app.getPath(), 'web', app.params.webWordDir);
    }
};

const BadRequest = require('areto/error/http/BadRequest');
const FileHelper = require('areto/helper/FileHelper');
const IndexHelper = require('areto/helper/IndexHelper');
const fs = require('fs');
const path = require('path');
