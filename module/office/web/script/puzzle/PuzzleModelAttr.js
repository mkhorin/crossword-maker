/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

Jam.PuzzleModelAttr = class PuzzleModelAttr extends Jam.ModelAttr {

    activate () {
        super.activate();

        this.model.events.one('close', this.onCloseModel.bind(this));

        this.nameAttr = this.model.getAttr('name');

        this.languageAttr = this.model.getAttr('language');
        this.languageAttr?.addChangeListener(this.onChangeLanguage.bind(this));

        this.themeAttr = this.model.getAttr('theme');
        this.themeAttr?.addChangeListener(this.onChangeTheme.bind(this));

        this.typeAttr = this.model.getAttr('type');
        this.typeAttr?.addChangeListener(this.onChangeType.bind(this));

        this.widthAttr = this.model.getAttr('width');
        this.widthAttr?.addChangeListener(this.onResize.bind(this));

        this.heightAttr = this.model.getAttr('height');
        this.heightAttr?.addChangeListener(this.onResize.bind(this));

        this.createPuzzle();
        this.onChangeLanguage();
        this.onChangeTheme();
        this.onChangeType();
        this.onResize();
    }

    onCloseModel () {
        this.puzzle.onClose();
    }

    onChangeLanguage () {
        const code = this.getLanguageCode();
        const id = this.languageAttr.getActualValue();
        this.puzzle.setLanguage(id, code);
    }

    onChangeTheme () {
        const name = this.getThemeName();
        const id = this.themeAttr.getActualValue();
        this.puzzle.setTheme(id, name);
    }

    onChangeType () {
        const type = this.typeAttr.getValue();
        this.puzzle.setType(type);
        this.puzzle.clear();
    }

    onResize () {
        const width = this.widthAttr?.getValue();
        const height = this.heightAttr?.getValue();
        this.puzzle.onResize(width, height);
    }

    onChangePuzzle () {
        this.puzzle.data = this.puzzle.exportData();
        this.setValue(JSON.stringify(this.puzzle.data));
        this.widthAttr.setValue(this.puzzle.grid.width);
        this.heightAttr.setValue(this.puzzle.grid.height);
        this.triggerChange();
    }

    createPuzzle () {
        const $puzzle = this.$attr.find('.puzzle');
        const data = Jam.Helper.parseJson(this.getValue());
        const title = this.nameAttr.getValue() || this.model.id;
        this.puzzle = new Puzzle($puzzle, data, title);
        this.puzzle.events.on('change', this.onChangePuzzle.bind(this));
        this.puzzle.init();
    }

    getLanguageCode () {
        const text = this.languageAttr.getValueText();
        return text?.match(/\((.+?)\)/)?.[1];
    }

    getThemeName () {
        return this.themeAttr.getValueText();
    }
};