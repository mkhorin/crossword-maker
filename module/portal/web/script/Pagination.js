'use strict';

Portal.Pagination = {

    props: {
        page: Number,
        pageSize: Number,
        totalSize: Number
    },
    data () {
        return {
            numPages: 0
        };
    },
    computed: {
        visible () {
            return this.numPages > 1;
        },
        pages () {
            const pages = [];
            for (let page = 0; page < this.numPages; ++page) {
                let active = page === this.page;
                let text = page + 1;
                pages.push({active, page, text});
            }
            return pages;
        }
    },
    watch: {
        totalSize () {
            this.numPages = Math.ceil(this.totalSize / this.pageSize);
        }
    },
    methods: {
        onPage (page) {
            this.changePage(Number(page));
        },
        onFirst () {
            this.changePage(0);
        },
        onPrev () {
            this.changePage(this.page - 1);
        },
        onNext () {
            this.changePage(this.page + 1);
        },
        onLast () {
            this.changePage(this.numPages - 1);
        },
        changePage (page) {
            if (page >= this.numPages) {
                page = this.numPages - 1;
            }
            if (page < 0) {
                page = 0;
            }
            if (page !== this.page) {
                this.$emit('change', page);
            }
        }
    },
    template: '#pagination'
};