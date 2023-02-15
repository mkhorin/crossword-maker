/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PdfExport {

    static TEXT_FONT = 'text';

    static getDefaultParams () {
        return {
            answerWithLineBreak: false,
            cellBorderColor: '#000000',
            cellBorderFactor: 0.03,
            cellFontFactor: 1.1,
            cellMarginFactor: 0.1,
            cellTextOptions: {
                baseline: 'top'
            },
            clueWithLineBreak: false,
            cluesOnNewPage: false,
            enclosedColor: '#a0a0a0',
            headerHeightFactor: .7,
            maxCellSize: 10,
            pageFormat: 'a4',
            pageOrientation: 'portrait',
            pageMargin: 10,
            showAnswers: false,
            textSize: 11,
            textLineHeightFactor: 0.5,
            textNormalFont: 'app/font/ptsans/ptsans-regular.ttf',
            textBoldFont: 'app/font/ptsans/ptsans-bold.ttf',
        };
    }

    static getClassByType (type) {
        switch (type) {
            case 'classic': return PdfExportClassic;
            case 'scan': return PdfExportScan;
        }
    }

    constructor (params) {
        this.JsPDF = window.jspdf.jsPDF;
        const defaults = this.constructor.getDefaultParams();
        this.params = Object.assign(defaults, params);
    }

    async execute ({id, title, grid, clues, theme}) {
        this.title = title;
        this.grid = this.createGrid(id, grid, clues, theme);
        this.createPdf();
        this.setTextFont();
        this.drawGrid();
        this.drawHeader();
        this.drawClues();
        if (this.params.showAnswers) {
            this.drawAnswers();
        }
        this.pdf.save(`${this.title}.pdf`);
    }

    createGrid () {
        return new PdfExportGrid(...arguments);
    }

    createPdf () {
        this.pdf = new this.JsPDF({
            format: this.params.pageFormat,
            orientation: this.params.pageOrientation
        });
        this.textSize = this.params.textSize;
        this.headerHeight = this.textSize * this.params.headerHeightFactor;
        this.pageMargin = this.params.pageMargin;
        this.pageMarginTop = this.params.pageMargin + this.headerHeight;
        this.pageWidth = this.pdf.internal.pageSize.getWidth();
        this.pageHeight = this.pdf.internal.pageSize.getHeight();
        this.pageInnerWidth = this.pageWidth - this.pageMargin * 2;
        this.pageInnerHeight = this.pageHeight - this.pageMarginTop - this.pageMargin;
        this.cellSize = this.resolveCellSize();
        this.cellBorderWidth = this.cellSize * this.params.cellBorderFactor;
        this.gridWidth = this.grid.width * this.cellSize;
        this.gridHeight = this.grid.height * (1 + this.params.cellBorderFactor) * this.cellSize;
        this.gridLeft = (this.pageInnerWidth - this.gridWidth) / 2 + this.pageMargin;
        this.gridTop = this.pageMarginTop;
    }

    getCells () {
        return this.grid.cellList;
    }

    resolveCellSize () {
        let width = this.pageInnerWidth / this.grid.width;
        let height = this.pageInnerHeight / this.grid.height;
        let size = width < height ? width : height;
        return size > this.params.maxCellSize
            ? this.params.maxCellSize
            : size;
    }

    setTextFont () {
        this.pdf.addFont(this.params.textNormalFont, this.constructor.TEXT_FONT, 'normal');
        this.pdf.addFont(this.params.textBoldFont, this.constructor.TEXT_FONT, 'bold');
        this.pdf.setFont(this.constructor.TEXT_FONT);
        this.pdf.setFontSize(this.textSize);
    }

    setBoldText () {
        this.setTextStyle('bold');
    }

    setNormalText () {
        this.setTextStyle('normal');
    }

    setTextStyle (style) {
        this.pdf.setFont(this.constructor.TEXT_FONT, style);
    }

    addPage () {
        this.pdf.addPage(this.params.pageFormat, this.params.pageOrientation);
        this.drawHeader();
    }

    drawHeader () {
        this.pdf.setFontSize(this.textSize);
        this.setBoldText();
        this.pdf.text(this.title, this.pageMargin, this.pageMargin);
    }

    drawGrid () {
        // need override
    }

    drawEmptyCells () {
        this.pdf.setFillColor(this.params.enclosedColor);
        const cells = this.getCells();
        for (const cell of cells) {
            if (cell.isEmpty() && cell.enclosed) {
                this.drawCell(cell, 'F');
            }
        }
    }

    drawCell (cell, ...params) {
        const pos = this.getDrawCellPosition(cell);
        this.pdf.setDrawColor(this.params.cellBorderColor);
        this.pdf.setLineWidth(this.cellBorderWidth);
        this.pdf.rect(pos.x, pos.y, this.cellSize, this.cellSize, ...params);
        return pos;
    }

    getDrawCellPosition (cell) {
        return {
            x: cell.x * this.cellSize + this.gridLeft,
            y: cell.y * this.cellSize + this.gridTop
        };
    }

    drawClues () {
        const lines = this.getLinesByKey('clue', this.params.clueWithLineBreak);
        const top = this.resolveCluesTop(lines);
        this.drawText(lines, this.pageMargin, top);
    }

    resolveCluesTop (lines) {
        if (!this.params.cluesOnNewPage) {
            const textHeight = this.resolveTextHeight(lines);
            const space = this.pageInnerHeight - this.gridHeight;
            if (textHeight <= space) {
                return this.pageMarginTop + this.gridHeight;
            }
        }
        this.addPage();
        return this.pageMarginTop;
    }

    drawAnswers () {
        const lines = this.getLinesByKey('word', this.params.answerWithLineBreak);
        this.addPage();
        this.drawText(lines, this.pageMargin, this.pageMarginTop);
    }

    drawText (lines, left, top) {
        for (const line of lines) {
            const {text, style, size} = this.getLineParams(line);
            this.setTextStyle(style);
            this.pdf.setFontSize(size);
            this.pdf.text(text, left, top);
            top += this.getLineHeight(size);
        }
    }

    getLinesByKey (key, lineBreak) {
        const horizontalBlocks = this.grid.getHorizontalBlocks();
        const verticalBlocks = this.grid.getVerticalBlocks();
        const horizontals = this.getTextLines(horizontalBlocks, key, lineBreak);
        const verticals = this.getTextLines(verticalBlocks, key, lineBreak);
        const lines = [''];
        lines.push({
            text: Jam.t('Across:'),
            style: 'bold'
        });
        lines.push(...horizontals);
        lines.push('');
        lines.push({
            text: Jam.t('Down:'),
            style: 'bold'
        });
        lines.push(...verticals);
        return lines;
    }

    getTextLines (blocks, key, lineBreak) {
        const items = this.getBlockTexts(blocks, key);
        const texts = lineBreak ? items : [items.join(' ')];
        const result = [];
        for (const text of texts) {
            const lines = this.pdf.splitTextToSize(text, this.pageInnerWidth);
            result.push(...lines);
        }
        return result;
    }

    getBlockTexts (blocks, key, empty = '-') {
        return blocks.map(block => `${block.number}. ${block[key] || empty}.`);
    }

    resolveTextHeight (lines) {
        let height = 0;
        for (const line of lines) {
            const {size} = this.getLineParams(line);
            height += this.getLineHeight(size);
        }
        return height;
    }

    getLineParams (line) {
        const params = {
            text: line,
            style: 'normal',
            size: this.textSize
        };
        if (typeof line === 'string') {
            return params;
        }
        return Object.assign(params, line);
    }

    getLineHeight (fontSize) {
        return fontSize * this.params.textLineHeightFactor;
    }
}