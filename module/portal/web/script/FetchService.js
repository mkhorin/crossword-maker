'use strict';

Portal.FetchService = {

    install (app, options) {
        const props = app.config.globalProperties;
        props.$fetch = {
            json (action, ...params) {
                return fetchBy('getJson', getDataUrl(action), ...params);
            },
            meta (action, ...params) {
                return fetchBy('getJson', getMetaUrl(action), ...params);
            },
            text (action, ...params) {
                return fetchBy('getText', getDataUrl(action), ...params);
            },
            file (metaClass, file, params) {
                const headers = {};
                const body = new FormData;
                body.append('file', file.name);
                body.append('file', file);
                const url = getUploadUrl(metaClass);
                params = {headers, body, ...params};
                return fetchBy('getJson', url, null, params);
            }
        };
        app.provide('fetch', options);

        function getDataUrl (action) {
            return `${options.dataUrl}/${action}`;
        }

        function getMetaUrl (action) {
            return `${options.metaUrl}/${action}`;
        }

        function getDownloadUrl (metaClass, id) {
            return `${getFileUrl('download', metaClass)}&id=${id}`;
        }

        function getUploadUrl (metaClass) {
            return getFileUrl('upload', metaClass);
        }

        function getFileUrl (action, metaClass) {
            return `${options.fileUrl}/${action}?c=${metaClass}`;
        }

        function fetchBy (name, url, data, params) {
            const {csrf} = options;
            const fetch = new Jam.Fetch;
            return fetch[name](url, {csrf, ...data}, params);
        }
    }
};