/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PdfExportClassic extends PdfExport {

    drawGrid () {
        this.drawEmptyCells();
        this.drawBlockCells();
    }

    drawBlockCells (cells) {
        const fontSize = this.cellSize * this.params.cellFontFactor;
        this.pdf.setFontSize(fontSize);
        for (const cell of this.getCells()) {
            if (cell.hasBlock()) {
                this.drawBlockCell(cell);
            }
        }
    }

    drawBlockCell (cell) {
        const {x, y} = this.drawCell(cell);
        const blocks = cell.getStartingBlocks();
        if (blocks.length) {
            const num = blocks[0].number.toString();
            const offset = this.cellSize * this.params.cellMarginFactor;
            this.pdf.text(num, x + offset, y + offset, this.params.cellTextOptions);
        }
    }
}