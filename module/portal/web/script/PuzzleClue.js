'use strict';

Portal.PuzzleClue = {
    props: {
        puzzle: String,
        theme: String,
        selectedBlock: Object
    },
    data () {
        return {
            loading: false,
            absent: false,
            clue: null
        };
    },
    watch: {
        selectedBlock () {
            this.resolveClue();
        }
    },
    methods: {
        async resolveClue () {
            this.loading = true;
            this.absent = false;
            let clue = null;
            let word = this.selectedBlock?.sourceWord;
            let id = this.selectedBlock?.clue;
            if (id) {
                clue = await this.$clues.getById(id);
            } else if (word) {
                const clues = await this.$clues.getByWord(word);
                clue = PuzzleHelper.getClue(clues, this.puzzle, this.theme);
            }
            this.clue = clue?._title;
            this.loading = false;
            this.absent = !this.clue;
        }
    },
    template: '#puzzleClue'
};