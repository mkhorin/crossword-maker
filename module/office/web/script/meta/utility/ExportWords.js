/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

Jam.Utility.ExportWords = class ExportWords extends Jam.Utility {

    async onItem (event) {
        const content = Jam.Helper.getTemplate('exportWordsForm');
        Jam.dialog.show(content, {
            css: 'primary',
            title: 'Export words',
            submitText: 'Export',
            beforeSubmit: this.onBeforeSubmit.bind(this),
            escaping: false
        });
        this.createForm();
    }

    createForm () {
        const $form = Jam.dialog.find('.form');
        this.form = new FormHandler($form);
        this.form.createAjaxSelect('language', {
            class: 'language'
        });
        this.form.init();
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
            language: this.form.getValue('language'),
            ...data
        });
    }
};