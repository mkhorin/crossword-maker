'use strict';

Portal.Puzzle = {
    props: {
        item: Object
    },
    data () {
        return {
            selectedBlock: null
        };
    },
    async created () {
    },
    methods: {
        onBlock (block) {
            this.selectedBlock = block;
        },
        onReadyWord (word) {
            this.$refs.grid.setWord(word);
        },
        onKeyboard (letter) {
            this.$refs.word.setLetter(letter);
        },
        getSourceWords () {
            return this.$refs.grid.getSourceWords();
        },
        reset () {
            this.$refs.grid.reset();
            this.$refs.word.reset();
        }
    },
    template: '#puzzle'
};