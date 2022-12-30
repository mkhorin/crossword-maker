'use strict';

Portal.PuzzleGridBlock = class PuzzleGridBlock {

    constructor (id, data) {
        this.id = id;
        this.clue = data.clue;
        this.size = data.cells.length;
        this.sourceWord = data.word;
        this.selected = false;
        this.word = null;
    }

    isValid () {
        return this.sourceWord?.length === this.size;
    }

    isSourceWord (word) {
        return this.sourceWord === word;
    }

    setCells (cells) {
        cells.forEach(cell => {
            if (cell.block1) {
                cell.block2 = this;
            } else {
                cell.block1 = this;
            }
        });
        this.cells = cells;
    }

    setWord (word) {
        this.cells.forEach((cell, index) => {
            if (word) {
                cell.letter = word[index];
            } else if (cell.block1 && cell.block2) {
                const other = cell.block1.id === this.id
                    ? cell.block2
                    : cell.block1;
                if (!other.word) {
                    cell.letter = null;
                }
            }
        });
        this.word = word;
    }

    clearWord () {
        this.cells.forEach(cell => {
            cell.letter = null;
        });
        this.word = null;
    }

    toggleSelect (state) {
        this.selected = state;
        this.cells.forEach(cell => cell.selected = state);
    }
};