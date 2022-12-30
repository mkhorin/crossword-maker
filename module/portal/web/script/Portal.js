'use strict';

const Portal = {

    props: {
        userId: String
    },
    data () {
        return {
            activePage: 'puzzle-list',
            activePuzzle: null,
        };
    },
    computed: {
        activePageProps () {
            switch (this.activePage) {
                case 'puzzle-view': {
                    return {
                        key: this.activePuzzle,
                        puzzle: this.activePuzzle,
                    };
                }
            }
        }
    },
    methods: {
        onMain () {
            this.activePage = 'puzzle-list';
        },
        onPuzzle (id) {
            this.activePage = 'puzzle-view';
            this.activePuzzle = id;
        },
    }
};