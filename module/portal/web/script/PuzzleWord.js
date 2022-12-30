'use strict';

Portal.PuzzleWord = {
    emits: ['ready'],
    props: {
        selectedBlock: Object
    },
    data () {
        return {
            letters: []
        };
    },
    computed: {
        valid () {
            return this.selectedBlock?.isSourceWord(this.getWord());
        },
        invalid () {
            return this.getWord() && !this.valid;
        }
    },
    watch: {
        selectedBlock () {
            this.setLetters();
        }
    },
    created () {
        this.setLetters();
    },
    methods: {
        isFixedLetter (index) {
            return !!this.selectedBlock?.cells[index]?.letter;
        },
        isWord () {
            return this.letters.length && !this.letters.includes(null);
        },
        getWord () {
            if (this.isWord()) {
                return this.letters.join('');
            }
        },
        onClearLetter (index) {
            if (!this.valid) {
                this.letters.splice(index, 1, null);
            }
        },
        setLetter (letter) {
            const index = this.letters.indexOf(null);
            if (index !== -1) {
                this.letters.splice(index, 1, letter);
            }
            if (this.valid) {
                this.$emit('ready', this.getWord());
            }
        },
        setLetters () {
            this.letters = this.selectedBlock
                ? this.selectedBlock.cells.map(({letter}) => letter || null)
                : [];
        },
        reset () {
            this.setLetters();
        }
    },
    template: '#puzzleWord'
};