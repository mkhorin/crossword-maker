'use strict';

Portal.PuzzleGridCell = {
    props: {
        selected: {
            type: Boolean,
            default: false
        },
        letter: String,
        x: Number,
        y: Number
    },
    computed: {
        left () {
            return this.getOffset(this.x);
        },
        top () {
            return this.getOffset(this.y);
        }
    },
    methods: {
        getOffset (position) {
            return `calc((var(--cell-size) - var(--border-width)) * ${position})`;
        }
    },
    template: '#puzzleGridCell'
};