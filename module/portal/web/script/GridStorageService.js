'use strict';

Portal.GridStorageService = {

    install (app, options) {

        const KEY = 'puzzleGrid';
        const storage = Jam.localStorage;
        const props = app.config.globalProperties;

        props.$gridStorage = {
            restore (id, blocks) {
                const data = getData();
                const words = data[id];
                if (words?.length === blocks.length) {
                    for (let i = 0; i < words.length; ++i) {
                        if (blocks[i].isSourceWord(words[i])) {
                            blocks[i].setWord(words[i]);
                        }
                    }
                }
            },
            save (id, blocks) {
                const data = getData();
                data[id] = blocks.map(({word}) => word);
                storage.set(KEY, data);
            },
            clear (id) {
                const data = getData();
                data[id] = [];
                storage.set(KEY, data);
            },
            clearAll () {
                storage.set(KEY, {});
            },
        };

        function getData () {
            const data = storage.get(KEY);
            return typeof data === 'object' && data ? data : {};
        }
    }
};