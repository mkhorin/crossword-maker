'use strict';

const parent = require('evado/config/default-utilities');

module.exports = {

    ...parent,

    'createPuzzlePdf': {
        Class: 'component/meta/utility/CreatePuzzlePdfUtility',
        enabled: true,
        name: 'Export to PDF',
        css: 'btn-outline-primary',
        clientClass: 'CreatePuzzlePdf',
        targetClass: 'puzzle',
        actions: ['update']
    },
    'exportWords': {
        Class: 'component/meta/utility/ExportWordsUtility',
        name: 'Export words',
        hint: 'Export words to frontend',
        enabled: true,
        css: 'btn-outline-primary',
        clientClass: 'ExportWords',
        targetClass: 'word',
        actions: ['index']
    },
    'importWords': {
        Class: 'component/meta/utility/ImportWordsUtility',
        name: 'Import words',
        enabled: true,
        css: 'btn-outline-success',
        clientClass: 'ImportWords',
        targetClass: 'word',
        actions: ['index']
    }
};