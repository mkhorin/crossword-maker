/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class FormHandler {

    constructor ($form, params) {
        this.$form = $form;
        this.$alert = this.$form.find('.alert');
        this.params = params || {};
    }

    init () {
        Jam.Helper.bindLabelsToInputs(this.$form);
        Jam.t(this.$form);
    }

    getAttr (name) {
        return this.getValueElement(name).closest('.form-attr');
    }

    getValues () {
        const data = {};
        const elements = this.getValueElements();
        for (const {name} of elements) {
            data[name] = this.getValue(name);
        }
        return data;
    }

    getValue (name) {
        const $element = this.getValueElement(name);
        const value = $element.val();
        const type = $element.attr('type');
        switch (type) {
            case 'checkbox': return this.getCheckboxValue(name);
            case 'number': return this.getNumberValue(name);
            case 'radio': return this.getRadioValue(name);
        }
        return value;
    }

    getCheckboxValue (name) {
        return this.getValueElement(name).is(':checked') || '';
    }

    getNumberValue (name) {
        const value = this.getValueElement(name).val();
        return value ? Number(value) : '';
    }

    getRadioValue (name) {
        return this.getValueElement(name).filter(':checked').val();
    }

    getValueElements () {
        return this.$form.find('[name]');
    }

    getValueElement (name) {
        return this.$form.find(`[name="${name}"]`);
    }

    setValues (data) {
        Object.entries(data).forEach(data => this.setValue(...data));
    }

    setValue (name, value) {
        const $element = this.getValueElement(name);
        const type = $element.attr('type');
        switch (type) {
            case 'checkbox': return this.setCheckboxValue(name, value);
            case 'radio': return this.setRadioValue(name, value);
        }
        $element.val(value);
    }

    setCheckboxValue (name, value) {
        this.getValueElement(name).prop('checked', !!value);
    }

    setRadioValue (name, value) {
        const $elements = this.getValueElement(name);
        for (const element of $elements) {
            element.checked = element.value === value;
        }
    }

    hasError () {
        return !this.$alert.hasClass('hidden') || this.getErrorAttrs().length > 0;
    }

    getErrorAttrs () {
        return this.$form.find('.has-error');
    }

    addError (name, message) {
        this.getAttr(name).addClass('has-error').find('.error-block').html(message);
    }

    clearErrors () {
        this.getErrorAttrs().removeClass('has-error');
        this.hideAlert();
    }

    showAlert (message) {
        this.$alert.removeClass('hidden').html(message);
    }

    hideAlert () {
        this.$alert.addClass('hidden');
    }

    createAjaxSelect (name, data, ajax) {
        data = {
            csrf: Jam.getCsrfToken(),
            ...data
        };
        ajax = {
            url: '/api/base/data/list',
            type: 'POST',
            dataType: 'json',
            processResults: this.processAjaxSelectResults.bind(this),
            data
        };
        this.getValueElement(name).select2({ajax});
    }

    processAjaxSelectResults (data) {
        return {
            results: data.items.map(({_id: id, _title: text}) => ({id, text}))
        };
    }

    validate () {
        this.clearErrors();
        this.validateRequiredAttrs();
        this.params.onValidate?.(this);
        return !this.hasError()
    }

    validateRequiredAttrs () {
        const elements = this.getValueElements();
        for (const {name} of elements) {
            if (this.getAttr(name).is('.required')) {
                this.validateRequiredAttr(name);
            }
        }
    }

    validateRequiredAttr (name) {
        const value = this.getValue(name);
        if (value !== 0 && !value) {
            return this.addError(name, Jam.t('Value cannot be blank'));
        }
    }
}