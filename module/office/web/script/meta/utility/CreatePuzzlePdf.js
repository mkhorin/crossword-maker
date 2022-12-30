/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

Jam.Utility.CreatePuzzlePdf = class CreatePuzzlePdf extends Jam.Utility {

    constructor () {
        super(...arguments);
        this.model = this.getModel();
        this.type = this.model.getAttr('type')?.getActualValue();
        this.theme = this.model.getAttr('theme')?.getActualValue();
        this.JobClass = PdfExport.getClassByType(this.type);
        this.values = this.JobClass.getDefaultParams();
    }

    async onItem (event) {
        if (this.checkModelChanges()) {
            return event.preventDefault();
        }
        const content = Jam.Helper.getTemplate('createPuzzlePdfForm');
        Jam.dialog.show(content, {
            css: 'primary export-pdf-dialog',
            title:'Export to PDF',
            submitText: 'Export',
            beforeSubmit: this.onBeforeSubmit.bind(this),
            escaping: false
        });
        this.createForm();
    }

    createForm () {
        const $form = Jam.dialog.find('.form');
        this.form = new FormHandler($form);
        this.form.init();
        this.form.setValues(this.values);
    }

    async onBeforeSubmit () {
        if (!this.form.validate()) {
            return false;
        }
        this.values = this.form.getValues();
        await this.executeJob();
        return true;
    }

    async executeJob () {
        const {puzzle} = this.model.getAttr('grid');
        const data = puzzle.exportData();
        const words = puzzle.grid.getWords();
        await puzzle.clues.load(words);
        const job = new this.JobClass(this.values);
        await job.execute({
            id: this.model.id,
            title: puzzle.title,
            grid: data,
            clues: puzzle.clues.clueMap,
            theme: this.theme
        });
    }
};