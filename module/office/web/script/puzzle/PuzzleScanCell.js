/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleScanCell extends PuzzleCell {

    static LABEL_CLASS = 'label';

    static isAdjacentCells (c1, c2) {
        return Math.abs(c1.x - c2.x) < 2 && Math.abs(c1.y - c2.y) < 2;
    }

    isAdjacentCell (cell) {
        return this.constructor.isAdjacentCells(this, cell);
    }

    isEmpty () {
        return super.isEmpty() && !this.label;
    }

    setLabel (block) {
        this.label = block;
    }

    selectBlock (current, {ctrlKey}) {
        if (ctrlKey && current && this.canLabel(current)) {
            return current.changeLabel(this);
        }
        super.selectBlock(...arguments);
    }

    canLabel (block) {
        return this.isEmpty() && this.isAdjacentCell(block.getFirstCell());
    }

    draw () {
        super.draw();
        this.toggleClass(this.constructor.LABEL_CLASS, !!this.label);
    }

    hasSelectedBlock () {
        return super.hasSelectedBlock() || !!this.label?.selected;
    }

    getNextBlock (current) {
        if (this.label) {
            return this.label === current ? null : this.label;
        }
        return super.getNextBlock(...arguments);
    }
}