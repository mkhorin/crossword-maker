'use strict';

Portal.Mixin = {

    methods: {
        t () {
            return Jam.i18n.translate(...arguments);
        },
        uid () {
            return `${Date.now()}${Jam.Helper.random(10000, 99999)}`;
        }
    }
};