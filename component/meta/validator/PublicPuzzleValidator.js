/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado-meta-base/validator/Validator');

module.exports = class PublicPuzzleValidator extends Base {

    async validateAttr (name, model) {
        const blocks = model.get('grid');
        if (!Array.isArray(blocks)) {
            return model.addError(name, this.getMessage());
        }
        if (!blocks.length) {
            return model.addError(name, this.getEmptyMessage());
        }
        const emptyBlock = blocks.find(({word}) => !word);
        if (emptyBlock) {
            return model.addError(name, this.getEmptyBlockMessage());
        }
    }

    getMessage () {
        return this.createMessage(this.message, 'Invalid grid');
    }

    getEmptyMessage () {
        return this.createMessage(this.emptyMessage, 'Grid is empty');
    }

    getEmptyBlockMessage () {
        return this.createMessage(this.emptyBlockMessage, 'There is empty grid block');
    }
};