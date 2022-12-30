/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PdfExportGrid {

    constructor (id, data, clues, theme) {
        this.id = id;
        this.theme = theme;
        this.prepareData(data);
        this.createCells(data);
        this.createBlocks(data);
        this.resolveEnclosedCells();
        this.numberBlocks();
        this.sortBlocksByNumber();
        this.resolveClues(clues);
    }

    getCell (x, y) {
        return this.cells[x]?.[y];
    }

    getHorizontalBlocks () {
        return this.blocks.filter(block => block.isHorizontal());
    }

    getVerticalBlocks () {
        return this.blocks.filter(block => block.isVertical());
    }

    resolveClues (clues) {
        this.blocks.forEach(block => block.resolveClue(clues));
    }

    createBlocks (items) {
        this.blocks = [];
        for (const item of items) {
            const block = this.createBlock(item);
            this.blocks.push(block);
        }
    }

    createBlock () {
        return new PdfExportGridBlock(this, ...arguments);
    }

    createCells (items) {
        this.cells = [];
        this.cellList = [];
        for (let x = 0; x < this.width; ++x) {
            let column = [];
            for (let y = 0; y < this.height; ++y) {
                column.push(this.createCell(x, y));
            }
            this.cells.push(column);
            this.cellList.push(...column);
        }
    }

    createCell () {
        return new PdfExportGridCell(this, ...arguments);
    }

    prepareData (items) {
        const cells = [];
        for (const item of items) {
            cells.push(...item.cells);
            item.label && cells.push(item.label);
        }
        const {left, top, right, bottom} = this.getBorders(cells);
        for (const cell of cells) {
            cell[0] -= left;
            cell[1] -= top;
        }
        this.width = right - left + 1;
        this.height = bottom - top + 1;
    }

    getBorders (cells) {
        const borders = {
            left: -1,
            top: -1,
            right: 0,
            bottom: 0
        };
        for (const [x, y] of cells) {
            this.setBorder(x, y, borders);
        }
        return borders;
    }

    setBorder (x, y, data) {
        if (data.left === -1 || x < data.left) {
            data.left = x;
        }
        if (x > data.right) {
            data.right = x;
        }
        if (data.top === -1 || y < data.top) {
            data.top = y;
        }
        if (y > data.bottom) {
            data.bottom = y;
        }
    }

    resolveEnclosedCells () {
        const cells = this.cellList.filter(cell => cell.isEmpty());
        while (this.changeEnclosedCells(cells)) {}
    }

    changeEnclosedCells (cells) {
        let changed = false;
        for (let cell of cells) {
            if (cell.enclosed && !cell.checkEnclosed()) {
                cell.enclosed = false;
                changed = true;
            }
        }
        return changed;
    }

    numberBlocks () {
        let number = 0;
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                let cell = this.getCell(x, y);
                let blocks = cell?.getStartingBlocks();
                if (blocks?.length) {
                    number += 1;
                    blocks.forEach(block => block.setNumber(number));
                }
            }
        }
    }

    sortBlocksByNumber () {
        this.blocks.sort((a, b) => a.number - b.number);
    }
}