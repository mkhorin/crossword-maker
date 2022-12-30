'use strict';

const Base = require('evado/Application');

module.exports = class CrosswordMakerApplication extends Base {

    constructor (config) {
        super({
            original: Base,
            ...config
        });
    }

};
module.exports.init(module);