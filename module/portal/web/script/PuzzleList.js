'use strict';

Portal.PuzzleList = {
    name: 'puzzle-list',
    emits: [
        'puzzle'
    ],
    props: {
        pageSize: {
            type: Number,
            default: 10
        }
    },
    data () {
        return {
            items: [],
            page: 0,
            totalSize: 0,
        };
    },
    computed: {
        empty () {
            return !this.items.length;
        }
    },
    async created () {
        await this.reload();
    },
    methods: {
        onPuzzle (id) {
            this.$emit('puzzle', id);
        },
        async reload () {
            await this.load(0);
        },
        async load (page) {
            const data = await this.$fetch.json('list', {
                class: 'puzzle',
                view: 'publicList',
                length: this.pageSize,
                start: page * this.pageSize,
                filter: this.getFilter()
            });
            this.items = this.formatItems(data.items);
            this.page = page;
            this.totalSize = data.totalSize;
        },
        getFilter () {
            const data = [];
            this.setFilterItem('language', data);
            this.setFilterItem('theme', data);
            return data;
        },
        setFilterItem (key, data) {
            const value = this.$refs[key]?.value;
            if (value) {
                data.push({
                    attr: key,
                    op: 'equal',
                    value
                });
            }
        },
        formatItems (items) {
            return items.map(item => ({
                ...item
            }));
        }
    },
    template: '#puzzleList'
};