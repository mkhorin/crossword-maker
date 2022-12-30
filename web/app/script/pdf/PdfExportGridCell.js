/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PdfExportGridCell {

    static DIRECTIONS = [[-1, 0], [0, -1], [0, 1], [1, 0]];

    constructor (grid, x, y) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.blocks = [];
        this.enclosed = true;
        this.label = null;
    }

    hasBlock () {
        return this.blocks.length > 0;
    }

    isEmpty () {
        return !this.hasBlock() && !this.label;
    }

    isEdge () {
        return this.x === 0
            || this.y === 0
            || this.x === this.grid.width - 1
            || this.y === this.grid.height - 1;
    }

    getStartingBlocks () {
        return this.blocks.filter(block => {
            return block.getFirstCell() === this;
        });
    }

    setBlock (block) {
        this.blocks.push(block);
    }

    setLabel (block) {
        this.label = block;
    }

    checkEnclosed () {
        if (this.isEdge()) {
            return false;
        }
        const {x, y} = this;
        for (const [dx, dy] of this.constructor.DIRECTIONS) {
            const cell = this.grid.getCell(x + dx, y + dy);
            if (!cell?.enclosed) {
                return false;
            }
        }
        return true;
    }
}