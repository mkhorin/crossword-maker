/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PdfExportScan extends PdfExport {

    static getDefaultParams () {
        return Object.assign(super.getDefaultParams(), {
            arrowColor: '#404040',
            arrowHeadFactor: 0.15,
            arrowTailFactor: 0.15,
            arrowTrunkFactor: 0.4,
            arrowWidthFactor: 0.03,
            labelFillColor: '#F0F0C0',
            maxCellSize: 15
        });
    }

    drawGrid () {
        this.drawEmptyCells();
        this.drawBlockCells();
        this.drawLabelCells();
    }

    drawBlockCells () {
        for (const cell of this.getCells()) {
            if (cell.hasBlock()) {
                this.drawCell(cell);
            }
        }
    }

    drawLabelCells (cells) {
        for (const cell of this.getCells()) {
            if (cell.label) {
                this.drawLabelCell(cell);
            }
        }
    }

    drawLabelCell (cell) {
        this.pdf.setFillColor(this.params.labelFillColor);
        const {x, y} = this.drawCell(cell, 'FD');
        this.drawLabelArrow(cell, x, y);
        const fontSize = this.cellSize * this.params.cellFontFactor;
        this.pdf.setFontSize(fontSize);
        const number = cell.label.number.toString();
        const offset = this.cellSize * this.params.cellMarginFactor;
        this.pdf.text(number, x + offset, y + offset, this.params.cellTextOptions);
    }

    drawLabelArrow (cell, x, y) {
        const cellSize = this.cellSize;
        const cellHalf = cellSize / 2;
        const block = cell.label;
        const start = block.getFirstCell();
        const dx = start.x - cell.x;
        const dy = start.y - cell.y;
        const {x: sx, y: sy} = this.getDrawCellPosition(start);
        const x1 = x + (1 + dx) * cellHalf;
        const y1 = y + (1 + dy) * cellHalf;
        const vertical = block.isVertical();
        const straight = vertical ? dx === 0 : dy === 0;
        const trunk = straight ? 0 : cellSize * this.params.arrowTrunkFactor;
        const x2 = sx + (1 - dx) * cellHalf + trunk * dx;
        const y2 = sy + (1 - dy) * cellHalf + trunk * dy;

        this.pdf.setDrawColor(this.params.arrowColor);
        this.pdf.setLineWidth(cellSize * this.params.arrowWidthFactor);
        this.pdf.line(x1, y1, x2, y2);

        const tail = cellSize * this.params.arrowTailFactor;
        const tx = vertical ? x2 : x2 + tail;
        const ty = vertical ? y2 + tail : y2;
        this.pdf.line(x2, y2, tx, ty);
        this.drawArrowHead(vertical, tx, ty);
    }

    drawArrowHead (vertical, cx, cy) {
        let side = this.cellSize * this.params.arrowHeadFactor;
        let half = side / 2;
        let height = half * Math.sqrt(3);
        let x1 = cx;
        let y1 = cy;
        let x2 = cx;
        let y2 = cy;
        let x3 = cx;
        let y3 = cy;
        if (vertical) {
            x1 = cx - half;
            y2 = cy + height;
            x3 = cx + half;
        } else {
            y1 = cy - half;
            x2 = cx + height;
            y3 = cy + half;
        }
        this.pdf.setFillColor(this.params.arrowColor);
        this.pdf.triangle(x1, y1, x2, y2, x3, y3, 'F');
    }
}