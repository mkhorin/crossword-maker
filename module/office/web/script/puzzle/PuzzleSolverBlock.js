/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleSolverBlock {

    constructor (id, source, solver) {
        this.id = id;
        this.solver = solver;
        this.source = source;
        this.free = !source.word;
        this.size = source.getSize();
        this.word = source.word;
        this.wordProvider = this.solver.dictionary.provider;
        this.createCells();
    }

    createCells () {
        this.cells = [];
        for (let i = 0; i < this.source.cells.length; ++i) {
            let sourceCell = this.source.cells[i];
            if (sourceCell.isCrossing()) {
                const cell = new PuzzleSolverCell(i, sourceCell, this);
                this.cells.push(cell);
            }
        }
    }

    connectCells () {
        this.cells.forEach(cell => cell.connect());
    }

    getCellBySource (source) {
        return this.cells.find(cell => cell.source === source);
    }

    setWordsBySize () {
        this.words = [...this.wordProvider.getBySize(this.size)];
    }

    setWordsByFixedLinks () {
        const lists = this.getWordsByFixedLinks();
        if (lists.length) {
            Jam.ArrayHelper.sortByLength(lists);
            this.words = Jam.ArrayHelper.intersectAll(...lists);
        }
    }

    getWordsByFixedLinks () {
        const lists = [];
        for (const {link, position} of this.cells) {
            if (!link.free) {
                const letter = link.getLetter();
                const words = this.wordProvider.getByLetter(letter, position, this.size);
                lists.push(words);
            }
        }
        return lists;
    }

    setWordsByLinks () {
        let changed = false;
        for (let cell of this.cells) {
            if (cell.link.free && this.setWordsByLink(cell)) {
                changed = true;
            }
        }
        return changed;
    }

    setWordsByLink ({link, position}) {
        const letters = this.getLettersByPosition(position);
        const linkLetters = link.block.getLettersByPosition(link.position);
        const sharedLetters = Jam.ArrayHelper.intersect(letters, linkLetters);
        const changed = letters.length !== sharedLetters.length;
        const linkChanged = linkLetters.length !== sharedLetters.length;
        if (!changed && !linkChanged) {
            return false;
        }
        const sharedLetterMap = Jam.ArrayHelper.flip(sharedLetters);
        if (changed) {
            this.setWordsByLetters(sharedLetterMap, position);
        }
        if (linkChanged) {
            link.block.setWordsByLetters(sharedLetterMap, link.position);
        }
        return true;
    }

    getLettersByPosition (position) {
        const data = {};
        for (const word of this.words) {
            data[word[position]] = true;
        }
        return Object.keys(data);
    }

    setWordsByLetters (letters, position) {
        this.words = this.words.filter(word => {
            return Object.prototype.hasOwnProperty.call(letters, word[position]);
        });
    }

    removeWords (words) {
        for (const word of words) {
            if (word.length === this.size) {
                const index = this.words.indexOf(word);
                if (index !== -1) {
                    this.words.splice(index, 1);
                }
            }
        }
    }

    getWorkerData () {
        return {
            cells: this.getWorkerCells(),
            words: this.words
        };
    }

    getWorkerCells () {
        const cells = [];
        for (const cell of this.cells) {
            if (cell.link.free) {
                cells.push(cell.getWorkerData());
            }
        }
        return cells;
    }
}