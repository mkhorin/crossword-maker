/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleGridHandler  {

    constructor (grid) {
        this.grid = grid;
        this.alert = grid.alert;
    }

    onCellDown ({currentTarget}) {
        this.startCell = this.getCellByElement(currentTarget);
        this.endCell = this.startCell;
    }

    onCellMove ({currentTarget}) {
        if (!this.startCell) {
            return true;
        }
        const current = this.getCellByElement(currentTarget);
        if (this.endCell === current) {
            return true;
        }
        if (this.grid.isReadOnly()) {
            return true;
        }
        if (!this.newBlock) {
            this.newBlock = this.grid.createBlock();
            this.newBlock.select();
            this.grid.deselectBlock();
        }
        this.newBlock.clear();
        this.endCell = current;
        if (this.endCell !== this.startCell) {
            this.newBlock.setCells(this.getSelectedCells());
            this.newBlock.validate();
            this.newBlock.draw();
        }
    }

    onCellUp (event) {
        if (this.startCell === this.endCell && this.startCell) {
            this.startCell.selectBlock(this.getSelectedBlock(), event);
            this.grid.triggerBlockSelect();
        }
        if (this.newBlock?.validate()) {
            this.grid.blocks.push(this.newBlock);
            this.grid.triggerBlockSelect();
            this.triggerChange();
        } else {
            this.newBlock?.clear();
        }
        this.newBlock = null;
        this.startCell = null;
        if (!this.alert.hasElement(event.target)) {
            this.alert.hide();
        }
    }

    getCellByElement (element) {
        return $(element).data('cell');
    }

    getSelectedBlock () {
        return this.grid.getSelectedBlock();
    }

    getSelectedCells () {
        return PuzzleCell.getLineCells(this.startCell, this.endCell, this.grid.cells);
    }

    triggerChange () {
        return this.grid.triggerChange(...arguments);
    }
}