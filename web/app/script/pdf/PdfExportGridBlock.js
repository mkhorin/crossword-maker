/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PdfExportGridBlock {

    constructor (grid, data) {
        this.grid = grid;
        this.word = data.word;
        this.clue = data.clue;
        this.number = 0;
        this.resolveCells(data.cells);
        this.resolveLabel(data.label);
    }

    isHorizontal () {
        return this.cells[0]?.y === this.cells[1]?.y;
    }

    isVertical () {
        return this.cells[0]?.x === this.cells[1]?.x;
    }

    getFirstCell () {
        return this.cells[0];
    }

    setNumber (value) {
        this.number = value;
    }

    resolveCells (items) {
        this.cells = [];
        for (const [x, y] of items) {
            const cell = this.grid.getCell(x, y);
            cell.setBlock(this);
            this.cells.push(cell);
        }
    }

    resolveLabel (data) {
        if (data) {
            const cell = this.grid.getCell(...data);
            cell.setLabel(this);
            this.label = cell;
        }
    }

    resolveClue (data) {
        const clues = data[this.word];
        if (!Array.isArray(clues)) {
            this.clue = null;
            return;
        }
        const id = this.clue;
        const clue = id
            ? PuzzleHelper.getClueById(id, clues)
            : PuzzleHelper.getClue(clues, this.grid.id, this.grid.theme);
        this.clue = clue?._title;
    }
}