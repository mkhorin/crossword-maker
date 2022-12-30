/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleClueProvider {

    static LIST_LENGTH = 1000;

    constructor (clues) {
        this.clues = clues;
        this.puzzle = clues.puzzle;
    }

    async list (words) {
        if (!words.length) {
            return null;
        }
        words = await this.requestJson('list', {
            class: 'word',
            filter: words.map(this.getRequestFilterWord, this),
            length: this.constructor.LIST_LENGTH
        });
        const clues = await this.requestJson('list', {
            filter: this.getRequestFilter(words?.items),
            length: this.constructor.LIST_LENGTH
        });
        return {
            clues: clues?.items,
            words: words?.items
        };
    }

    async create (data) {
        return await this.requestText('create', {data});
    }

    async update (id, data) {
        return await this.requestText('update', {id, data});
    }

    async delete (id) {
        return await this.requestText('delete', {id});
    }

    async linkToTheme (clue) {
        const theme = this.puzzle.themeId;
        if (theme) {
            return await this.requestText('create', {
                class: 'clueToTheme',
                data: {clue, theme}
            });
        }
    }

    requestJson (action, params, loading) {
        return this.request(action, params, 'getJson', false);
    }

    requestText (action, params) {
        return this.request(action, params, 'getText', true);
    }

    async request (action, params, method, loading) {
        try {
            if (loading) {
                Jam.showLoader();
            }
            const url = this.getUrl(action);
            params = this.getRequestParams(params);
            return await (new Jam.Fetch)[method](url, params);
        } catch (err) {
            this.puzzle.alert.danger(String(err));
        } finally {
            Jam.hideLoader();
        }
    }

    getUrl (action) {
        return `api/base/data/${action}`;
    }

    getRequestParams (params) {
        return {
            class: 'clue',
            csrf: Jam.getCsrfToken(),
            ...params
        };
    }

    getRequestFilter (words) {
        const filter = [this.getRequestFilterWords(words)];
        const theme = this.getRequestFilterTheme();
        if (theme) {
            filter.push(theme);
        }
        return filter;
    }

    getRequestFilterTheme () {
        if (!this.puzzle.themeId) {
            return null;
        }
        const cluesWithoutAnyTheme = {
            attr: 'themes',
            op: 'equal',
            value: ''
        };
        const cluesWithSelectedTheme = {
            or: true,
            attr: 'themes',
            op: 'nested',
            value: {
                attr: 'theme',
                op: 'equal',
                value: this.puzzle.themeId
            }
        };
        return {items: [cluesWithoutAnyTheme, cluesWithSelectedTheme]};
    }

    getRequestFilterWords (items) {
        return {
            attr: 'word',
            op: 'equal',
            value: items.map(({_id}) => _id)
        };
    }

    getRequestFilterWord (word) {
        return {
            or: true,
            attr: 'value',
            op: 'equal',
            value: word
        };
    }

    showError (err) {
        this.puzzle.alert.danger(String(err));
    }
}