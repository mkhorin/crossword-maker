'use strict';

module.exports = {

    title: 'CrosswordMaker',

    components: {
        'bodyParser': {
            urlencoded: {
                parameterLimit: 500000
            }
        },
        'db': {
            settings: {
                'database': process.env.MONGO_NAME || 'crossword-maker',
            }
        },
        'cookie': {
            secret: 'crossword-maker.sign' // key to sign cookie
        },
        'session': {
            secret: 'crossword-maker.sign'  // key to sign session ID cookie
        },
        'i18n': {
            language: 'en'
        },
        'router': {
            //defaultModule: 'portal'
        }
    },
    metaModels: {
        'base': {
            Class: require('evado-meta-base/base/BaseMeta')
        },
        'navigation': {
            Class: require('evado-meta-navigation/base/NavMeta')
        }
    },
    modules: {
        'api': {
            config: {
                modules: {
                    'base': {
                        Class: require('evado-api-base/Module')
                    }
                }
            }
        },
        'studio': {
            Class: require('evado-module-studio/Module')
        },
        'office': {
            Class: require('../module/office/Module')
        },
        'account': {
            Class: require('evado-module-account/Module')
        },
        'admin': {
            Class: require('evado-module-admin/Module')
        },
        'portal': {
            Class: require('../module/portal/Module')
        }
    },
    assets: require('./default-assets'),
    users: require('./default-users'),
    userFilters: require('./default-userFilters'),
    security: require('./default-security'),
    notifications: require('./default-notifications'),
    tasks: require('./default-tasks'),
    utilities: require('./default-utilities'),
    eventHandlers: require('./default-eventHandlers'),
    listeners: require('./default-listeners'),
    sideMenu: require('./default-sideMenu'),
    widgets: require('./default-widgets'),
    params: {
        'enablePasswordChange': false,
        'enablePasswordReset': false,
        'enableSignUp': false,
        'enableSignUpVerification': false,
        'languageToggle': true,
        'webWordDir': 'app/word'
    }
};