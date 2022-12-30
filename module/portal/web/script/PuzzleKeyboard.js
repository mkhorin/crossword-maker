'use strict';

Portal.PuzzleKeyboard = {
    emits: ['letter'],
    props: {
        active: {
            type: Boolean,
            default: false
        },
        language: String
    },
    methods: {
        onKey (letter) {
            if (this.active) {
                this.$emit('letter', letter);
            }
        },
        getLetters () {
            switch (this.language) {
                case 'Russian': {
                    return 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
                }
            }
            return 'abcdefghijklmnopqrstuvwxyz';
        },

    },
    template: '#puzzleKeyboard'
};