/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado-meta-base/validator/Validator');

module.exports = class WordPatternValidator extends Base {

    async validateAttr (name, model) {
        const language = await model.related.resolve('language');
        const pattern = language?.get('wordPattern');
        if (!pattern) {
            return;
        }
        try {
            const regex = new RegExp(pattern);
            const word = model.get(name);
            if (!regex.test(word)) {
                model.addError(name, this.getMessage());
            }
        } catch (err) {
            language.log('error', 'Invalid word pattern');
            model.addError(name, 'Metadata error');
        }
    }

    getMessage () {
        return this.createMessage(this.message, 'Invalid word by language pattern');
    }
};