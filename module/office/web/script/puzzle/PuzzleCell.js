/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleCell {

    static DIRECTIONS = [[-1, 0], [0, -1], [0, 1], [1, 0]];

    static SINGLE_CLASS = 'single';
    static CROSS_CLASS = 'cross';
    static ERROR_CLASS = 'error';
    static SELECTED_CLASS = 'selected';

    static getBlockClassByCounter (counter) {
        switch (counter) {
            case 0: return;
            case 1: return this.SINGLE_CLASS;
            case 2: return this.CROSS_CLASS;
        }
        return `${this.ERROR_CLASS} ${this.CROSS_CLASS}`;
    }

    static getLineCells (start, end, cells) {
        if (!start || !end) {
            return [];
        }
        const result = [start];
        const [dx, dy] = this.getDirection(start, end);
        do {
            start = cells[start.x + dx]?.[start.y + dy];
            if (start) {
                result.push(start);
            }
        } while (start && (dy === 0 ? start.x !== end.x : start.y !== end.y));
        return dx < 0 || dy < 0 ? result.reverse() : result;
    }

    static getDirection (start, end) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        return Math.abs(dx) > Math.abs(dy)
            ? [Math.sign(dx), 0]
            : [0, Math.sign(dy)];
    }

    static resolveBorders ({x, y}, data) {
        if (x > data.right) {
            data.right = x;
        }
        if (y > data.bottom) {
            data.bottom = y;
        }
        if (data.left === -1 || x < data.left) {
            data.left = x;
        }
        if (data.top === -1 || y < data.top) {
            data.top = y;
        }
    }

    constructor (grid, x, y) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.blocks = [];
    }

    isCrossing () {
        return this.blocks.length > 1;
    }

    isEdge () {
        return this.x === 0
            || this.y === 0
            || this.x === this.grid.width - 1
            || this.y === this.grid.height - 1;
    }

    isEmpty () {
        return this.blocks.length === 0;
    }

    getCrossLetter (block) {
        return this.getCrossBlock(block)?.getLetterByCell(this);
    }

    getCrossBlock (source) {
        for (let block of this.blocks) {
            if (block !== source) {
                return block;
            }
        }
    }

    getLetter () {
        for (let block of this.blocks) {
            if (block.word) {
                return block.getLetterByCell(this);
            }
        }
    }

    clear () {
        this.blocks = [];
    }

    linkToElement ($cell) {
        this.$cell = $cell;
        this.$cell.data('cell', this);
        this.$letter = $cell.find('.letter');
    }

    clearBlock (block) {
        const index = this.blocks.indexOf(block);
        if (index !== -1) {
            this.blocks.splice(index, 1);
        }
    }

    setBlock (block) {
        const index = this.blocks.indexOf(block);
        if (index === -1) {
            this.blocks.push(block);
        }
    }

    selectBlock (current) {
        current?.deselect();
        this.getNextBlock(current)?.select();
    }

    getNextBlock (current) {
        const {blocks} = this;
        const first = blocks[0];
        if (blocks.length < 2) {
            return first === current ? null : first;
        }
        for (let i = 0; i < blocks.length; ++i) {
            if (blocks[i] === current) {
                return blocks[i + 1] || first;
            }
        }
        return first;
    }

    draw () {
        this.removeClass(this.constructor.SINGLE_CLASS);
        this.removeClass(this.constructor.CROSS_CLASS);
        this.toggleClass(this.constructor.ERROR_CLASS, this.hasErrorBlock());
        this.toggleClass(this.constructor.SELECTED_CLASS, this.hasSelectedBlock());
        this.addClass(this.constructor.getBlockClassByCounter(this.blocks.length));
        this.drawLetter()
    }

    drawLetter () {
        this.$letter.html(this.getLetter() || '');
    }

    hasBlock () {
        return this.blocks.length > 0;
    }

    hasErrorBlock () {
        for (const block of this.blocks) {
            if (block.error) {
                return true;
            }
        }
        return false;
    }

    hasBlockStart (vertical) {
        for (const block of this.blocks) {
            if (block.getFirstCell() === this) {
                if (block.isVertical() === vertical) {
                    return true;
                }
            }
        }
        return false;
    }

    hasBlockEnd (vertical) {
        for (const block of this.blocks) {
            if (block.getLastCell() === this) {
                if (block.isVertical() === vertical) {
                    return true;
                }
            }
        }
        return false;
    }

    hasSelectedBlock () {
        for (const block of this.blocks) {
            if (block.selected) {
                return true;
            }
        }
        return false;
    }

    getStartingBlocks () {
        return this.blocks.filter(block => {
            return block.getFirstCell() === this;
        });
    }

    addClass () {
        this.$cell.addClass(...arguments);
    }

    removeClass () {
        this.$cell.removeClass(...arguments);
    }

    toggleClass () {
        this.$cell.toggleClass(...arguments);
    }

    resolveBlockBorders (data) {
        if (!this.isEmpty()) {
            this.constructor.resolveBorders(this, data);
        }
    }
}