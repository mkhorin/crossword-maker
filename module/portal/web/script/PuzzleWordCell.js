'use strict';

Portal.PuzzleWordCell = {
    emits: ['clear'],
    props: {
        index: Number,
        letter: String,
        fixed: Boolean
    },
    methods: {
        onCell () {
            if (!this.fixed) {
                this.$emit('clear', this.index);
            }
        }
    },
    template: '#puzzleWordCell'
};