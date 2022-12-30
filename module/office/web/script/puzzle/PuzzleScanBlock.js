/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleScanBlock extends PuzzleBlock  {

    static LABEL_DIRECTIONS = [[-1, 0], [0, -1], [0, 1], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];

    constructor () {
        super(...arguments);
        this.label = null;
    }

    clear () {
        super.clear();
        this.label = null;
    }

    clearCells () {
        super.clearCells();
        this.label?.setLabel(null);
    }

    setCells () {
        super.setCells(...arguments);
        this.setLabel(this.label || this.findLabel());
    }

    setLabel (cell) {
        this.label?.setLabel(null);
        this.label = cell;
        this.label?.setLabel(this);
    }

    changeLabel (cell) {
        this.label?.setLabel(null);
        this.label?.draw();
        this.label = cell;
        this.label?.setLabel(this);
        this.label?.draw();
        this.grid.triggerChange();
    }

    findLabel () {
        const first = this.getFirstCell();
        if (first) {
            for (const [dx, dy] of this.constructor.LABEL_DIRECTIONS) {
                const cell = this.grid.getCell(first.x + dx, first.y + dy);
                if (cell?.isEmpty()) {
                    return cell;
                }
            }
        }
    }

    offset (dx, dy) {
        this.label = this.label?.grid.getCell(this.label.x + dx, this.label.y + dy);
        super.offset(dx, dy);
    }

    draw () {
        super.draw();
        this.label?.draw();
    }

    validate () {
        if (super.validate()) {
            this.error = !this.label || this.isLabelIntersection();
        }
        return !this.error;
    }

    isLabelIntersection () {
        for (const cell of this.cells) {
            if (cell.label) {
                return true;
            }
        }
        return false;
    }

    exportData () {
        return Object.assign(super.exportData(), {
            label: this.exportLabel()
        });
    }

    exportLabel () {
        return this.label ? [this.label.x, this.label.y] : null;
    }

    importData (data) {
        if (!super.importData(data)) {
            return false;
        }
        try {
            this.label = this.parseLabel(data.label);
            return true;
        } catch (err) {
            console.warn(err);
        }
    }

    parseLabel ([x, y]) {
        const cell = this.grid.getCell(x, y);
        if (!cell) {
            throw new Error(`Cell not found: ${x}, ${y}`);
        }
        return cell;
    }
}