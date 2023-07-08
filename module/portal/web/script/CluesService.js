'use strict';

Portal.CluesService = {

    install (app, options) {
        const clueMap = {};
        const wordClueMap = {};
        const props = app.config.globalProperties;

        props.$clues = {
            async getById (id) {
                if (!Object.hasOwn(clueMap, id)) {
                    await loadById(id);
                }
                return clueMap[id];
            },
            async getByWord (word) {
                if (!getCluesByWord(word)) {
                    await loadByWord(word);
                }
                return getCluesByWord(word);
            },
            async getByWords (words) {
                const absentWords = words.filter(word => !getCluesByWord(word));
                await loadByWords(absentWords);
                const data = {};
                for (const word of words) {
                    data[word] = getCluesByWord(word);
                }
                return data;
            }
        };

        function getCluesByWord (word) {
            return Array.isArray(wordClueMap[word]) ? wordClueMap[word] : null;
        }

        async function loadById (id) {
            try {
                const params = getFetchParams({id});
                clueMap[id] = await props.$fetch.json('read', params);
            } catch (err) {
                clueMap[id] = null;
                console.error(err);
            }
        }

        async function loadByWords (words) {
            try {
                if (words.length) {
                    const filter = getFilterByWords(words);
                    const length = 1000;
                    const params = getFetchParams({filter, length});
                    const {items} = await props.$fetch.json('list', params);
                    indexClues(items);
                }
            } catch (err) {
                wordClueMap[word] = [];
                console.error(err);
            }
        }

        function getFilterByWords (words) {
            const items = words.map(getEqualFilter);
            items.forEach(item => item.or = true);
            return {
                attr: 'word',
                op: 'nested',
                value: items
            };
        }

        function indexClues (items) {
            for (const item of items) {
                const word = item.word?.value;
                let clues = getCluesByWord(word);
                if (!clues) {
                    clues = [];
                    wordClueMap[word] = clues;
                }
                clues.push(item);
            }
        }

        async function loadByWord (word) {
            try {
                const filter = getFilterByWord(word);
                const params = getFetchParams({filter});
                const {items} = await props.$fetch.json('list', params);
                wordClueMap[word] = items;
            } catch (err) {
                wordClueMap[word] = [];
                console.error(err);
            }
        }

        function getFilterByWord (word) {
            return {
                attr: 'word',
                op: 'nested',
                value: getEqualFilter(word)
            };
        }

        function getEqualFilter (value) {
            return {
                attr: 'value',
                op: 'equal',
                value
            };
        }

        function getFetchParams (params) {
            return {
                class: 'clue',
                view: 'list',
                ...params
            };
        }
    }
};