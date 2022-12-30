/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleBlock {

    static MIN_SIZE = 2;

    static createBlocks (items, grid) {
        const blocks = [];
        if (Array.isArray(items)) {
            for (const item of items) {
                const block = grid.createBlock();
                if (block.importData(item)) {
                    block.setCells();
                    blocks.push(block);
                }
            }
        }
        return blocks;
    }

    constructor (grid) {
        this.grid = grid;
        this.error = false;
        this.selected = false;
        this.cells = [];
    }

    getFirstCell () {
        return this.cells[0];
    }

    getLastCell () {
        return this.cells[this.cells.length - 1];
    }

    getSize () {
        return this.cells.length;
    }

    isVertical () {
        return this.cells[0]?.x === this.cells[1]?.x;
    }

    clear () {
        this.clearCells();
        this.draw();
        this.cells = [];
    }

    clearCells () {
        this.cells.forEach(cell => cell.clearBlock(this));
    }

    setCells (cells) {
        this.cells = cells || this.cells;
        this.cells.forEach(cell => cell.setBlock(this));
    }

    deselect () {
        if (this.selected) {
            this.selected = false;
            this.draw();
        }
    }

    select () {
        if (!this.selected) {
            this.selected = true;
            this.draw();
        }
    }

    canSetWord (word) {
        return this.getSize() === word.length
            && this.checkCrossLetters(word);
    }

    checkCrossLetters (word) {
        const letters = this.getCrossLetters();
        for (let i = 0; i < letters.length; ++i) {
            if (letters[i] && letters[i] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    getCrossLetters () {
        const letters = [];
        for (const cell of this.cells) {
            letters.push(cell.getCrossLetter(this));
        }
        return letters;
    }

    getLetterByCell (cell) {
        return this.word?.[this.cells.indexOf(cell)];
    }

    setWord (word) {
        if (this.canSetWord(word)) {
            this.word = word;
            this.draw();
            return true;
        }
    }

    draw () {
        this.cells.forEach(cell => cell.draw());
    }

    offset (dx, dy) {
        const cells = this.cells.map(({x, y}) => {
            return this.grid.getCell(x + dx, y + dy);
        });
        this.setCells(cells);
    }

    removeWord () {
        this.word = null;
        this.draw();
    }

    importData (data) {
        try {
            this.cells = this.parseCells(data.cells);
            this.word = data.word;
            this.clue = data.clue;
            return true;
        } catch (err) {
            console.warn(err);
        }
    }

    parseCells (items) {
        const cells = [];
        for (const [x, y] of items) {
            const cell = this.grid.getCell(x, y);
            if (!cell) {
                throw new Error(`Cell not found: ${x}, ${y}`);
            }
            cells.push(cell);
        }
        if (cells.length < this.constructor.MIN_SIZE) {
            throw new Error(`Block is too short: ${items}`);
        }
        return cells;
    }

    validate () {
        this.error = this.getSize() < this.constructor.MIN_SIZE
            || this.isParallelIntersection()
            || this.isBlockBorderContact()
            || this.isPerpendicularContact();
        return !this.error;
    }

    isParallelIntersection () {
        const vertical = this.isVertical();
        for (const cell of this.cells) {
            for (const block of cell.blocks) {
                if (block !== this) {
                    if (block.isVertical() === vertical) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isBlockBorderContact () {
        const first = this.getFirstCell();
        const last = this.getLastCell();
        const [dx, dy] = this.grid.PuzzleCell.getDirection(first, last);
        const prev = this.grid.getCell(first.x - dx, first.y - dy);
        const next = this.grid.getCell(last.x + dx, last.y + dy);
        return prev?.hasBlock() || next?.hasBlock();
    }

    isPerpendicularContact () {
        const first = this.getFirstCell();
        const last = this.getLastCell();
        const direction = this.grid.PuzzleCell.getDirection(first, last);
        const dx = direction[0] ? 0 : 1;
        const dy = direction[1] ? 0 : 1;
        const vertical = direction[0] === 0;
        for (const {x, y} of this.cells) {
            const next = this.grid.getCell(x + dx, y + dy);
            if (next?.hasBlockStart(!vertical)) {
                return true;
            }
            const prev = this.grid.getCell(x - dx, y - dy);
            if (prev?.hasBlockEnd(!vertical)) {
                return true;
            }
        }
        return false;
    }

    exportData () {
        return {
            cells: this.exportCells(),
            word: this.word,
            clue: this.exportClue()
        };
    }

    exportCells () {
        return this.cells.map(cell => ([cell.x, cell.y]));
    }

    exportClue () {
        if (!this.word) {
            return null;
        }
        const clue = this.grid.puzzle.clues.getSelectedClueByWord(this.word);
        if (clue === false) {
            return null;
        }
        return clue?._id || this.clue;
    }
}