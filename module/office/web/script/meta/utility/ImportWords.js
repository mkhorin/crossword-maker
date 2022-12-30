/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

Jam.Utility.ImportWords = class ImportWords extends Jam.Utility {

    static THEME_ATTR = 'theme';
    static SKIP_NEW_WORDS_ATTR = 'skipNewWords';
    static WORD_ATTR = 'words';
    static WORD_PATTERN = /^[a-zа-яё]{2,16}$/;
    static CLUE_SEPARATOR = ';';
    static MAX_WORDS = 10000;
    static MAX_CLUES = 10;
    static MAX_CLUE_LENGTH = 100;

    async onItem (event) {
        const content = Jam.Helper.getTemplate('importWordsForm');
        Jam.dialog.show(content, {
            css: 'success',
            title: 'Import words',
            submitText: 'Import',
            beforeSubmit: this.onBeforeSubmit.bind(this),
            escaping: false
        });
        this.createForm();
    }

    createForm () {
        const $form = Jam.dialog.find('.form');
        this.form = new FormHandler($form, {
            onValidate: this.validate.bind(this)
        });
        this.form.createAjaxSelect(this.constructor.THEME_ATTR, {
            class: 'theme'
        });
        this.form.init();
    }

    validate () {
        this.words = this.validateWords();
    }

    validateWords () {
        const result = [], errors = [];
        const lineBreak = String.fromCharCode(10);
        const rows = this.form.getValue(this.constructor.WORD_ATTR).split(lineBreak);
        const max = this.constructor.MAX_WORDS;
        if (rows.length > max) {
            const error = Jam.t(['Too many words (max {max})', {max}]);
            return this.form.addError(this.constructor.WORD_ATTR, error);
        }
        for (const row of rows) {
            this.validateRow(row, result, errors);
        }
        if (errors.length) {
            return this.form.addError(this.constructor.WORD_ATTR, errors.join('<br>'));
        }
        if (!result.length) {
            const error = Jam.t('Value cannot be blank');
            return this.form.addError(this.constructor.WORD_ATTR, error);
        }
        return result;
    }

    validateRow (row, result, errors) {
        row = $.trim(row);
        if (!row) {
            return;
        }
        let [word, ...clues] = row.split(this.constructor.CLUE_SEPARATOR);
        word = word.toLocaleLowerCase();
        if (!this.validateWord(word)) {
            return errors.push(`${Jam.t('Invalid word')}: ${row}`);
        }
        if (!this.validateClues(clues)) {
            return errors.push(`${Jam.t('Invalid clue')}: ${row}`);
        }
        result.push([word, ...clues].join(this.constructor.CLUE_SEPARATOR));
    }

    validateWord (word) {
        return this.constructor.WORD_PATTERN.test($.trim(word));
    }

    validateClues (clues) {
        if (clues.length > this.constructor.MAX_CLUES) {
            return false;
        }
        for (const clue of clues) {
            if (!this.validateClue(clue)) {
                return false;
            }
        }
        return true;
    }

    validateClue (clue) {
        if (clue.length > this.constructor.MAX_CLUE_LENGTH) {
            return false;
        }
        return $.trim(clue).length;
    }

    async onBeforeSubmit () {
        if (!this.form.validate()) {
            return false;
        }
        try {
            Jam.showLoader();
            const url = this.getUrl();
            const data = this.getRequestData();
            const result = await Jam.post(url, data);
            Jam.hideLoader();
            const list = this.getList();
            list?.reload();
            list?.alert.success(result);
            return true;
        } catch (err) {
            Jam.hideLoader();
            this.showAlert(err.responseText || err);
        }
    }

    getRequestData (data) {
        return super.getRequestData({
            theme: this.form.getValue(this.constructor.THEME_ATTR),
            skipNewWords: this.form.getValue(this.constructor.SKIP_NEW_WORDS_ATTR),
            words: this.words,
            ...data
        });
    }
};