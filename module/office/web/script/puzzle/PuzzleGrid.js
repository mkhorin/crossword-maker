/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleGrid {

    static MIN_GRID_SIZE = 1;
    static MAX_GRID_SIZE = 100;

    static BLOCK_SELECT_EVENT = 'blockSelect';
    static WORD_SELECT_EVENT = 'wordSelect';

    static resolveSize (s) {
        s = Math.round(s);
        return s < this.MIN_GRID_SIZE || s > this.MAX_GRID_SIZE ? this.MIN_GRID_SIZE : s;
    }

    constructor ($container, puzzle) {
        this.puzzle = puzzle;
        this.alert = puzzle.alert;
        this.blocks = [];
        this.events = new Jam.Events(this.constructor.name);
        this.lastClick = false;
        this.$container = $container;
    }

    init () {
        this.$container.on('mousedown', '.puzzle-cell', this.onCellDown.bind(this));
        this.$container.on('mousemove', '.puzzle-cell', this.onCellMove.bind(this));

        const mouseUp = `mouseup.${this.constructor.name}`;
        $(window).off(mouseUp).on(mouseUp, this.onCellUp.bind(this));

        const keyUp = `keyup.${this.constructor.name}`;
        $(window).off(keyUp).on(keyUp, this.onKeyUp.bind(this));

        this.puzzle.events.on(Puzzle.CHANGE_MODE_EVENT, this.onChangeMode.bind(this));
        this.puzzle.dictionary.events.on(PuzzleDictionary.WORD_SELECT_EVENT, this.onSelectDictionaryWord.bind(this));
        this.handler = new PuzzleGridHandler(this);
    }

    isReadOnly () {
        return this.puzzle.solver.running;
    }

    setClassicType () {
        this.PuzzleBlock = PuzzleBlock;
        this.PuzzleCell = PuzzleCell;
    }

    setScanType () {
        this.PuzzleBlock = PuzzleScanBlock;
        this.PuzzleCell = PuzzleScanCell;
    }

    onChangeMode () {
        if (this.puzzle.isGridMode()) {
            const word = this.puzzle.gridWords.getSelectedWord();
            const block = this.getBlockByWord(word);
            this.selectBlock(block);
        }
    }

    onSelectDictionaryWord (event, {word}) {
        if (!this.isReadOnly()) {
            const block = this.getSelectedBlock();
            if (block?.setWord(word)) {
                this.triggerWordSelect();
                this.triggerChange();
            }
        }
    }

    onCellDown () {
        return this.handler.onCellDown(...arguments);
    }

    onCellMove () {
        return this.handler.onCellMove(...arguments);
    }

    onCellUp ({target}) {
        this.lastClick = $(target).closest(this.$container).length > 0;
        return this.handler.onCellUp(...arguments);
    }

    onKeyUp ({key}) {
        if (!this.lastClick) {
            return false;
        }
        switch (key) {
            case 'Delete': {
                this.deleteByContext();
                break;
            }
        }
    }

    getCell (x, y) {
        return this.cells[x]?.[y];
    }

    getHorizontalBlocks () {
        return this.blocks.filter(block => !block.isVertical());
    }

    getVerticalBlocks () {
        return this.blocks.filter(block => block.isVertical());
    }

    getBlockByWord (word) {
        return this.blocks.find(block => word && block.word === word);
    }

    getEmptyBlocks () {
        return this.blocks.filter(({word}) => !word);
    }

    getSelectedBlock () {
        return this.blocks.find(({selected}) => selected);
    }

    getSelectedWord () {
        return this.getSelectedBlock()?.word;
    }

    isEmpty () {
        return this.blocks.length === 0;
    }

    clear () {
        this.deselectBlock();
        this.blocks = [];
        this.createCells();
        this.draw();
    }

    selectBlock (block) {
        this.getSelectedBlock()?.deselect();
        block?.select();
        this.triggerBlockSelect();
    }

    deselectBlock () {
        const block = this.getSelectedBlock();
        if (block) {
            block.deselect();
            this.triggerBlockSelect();
        }
    }

    createCells () {
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
        return new this.PuzzleCell(this, ...arguments);
    }

    createBlocks (data) {
        this.blocks = this.PuzzleBlock.createBlocks(data, this);
    }

    createBlock () {
        return new this.PuzzleBlock(this, ...arguments);
    }

    onResize (w, h) {
        if (this.width !== w || this.height !== h) {
            this.resize(w, h)
        }
    }

    resize (w, h) {
        this.width = this.constructor.resolveSize(w);
        this.height = this.constructor.resolveSize(h);
        this.$container.css('--columns', this.width);
        this.$container.css('--rows', this.height);
        this.deselectBlock();
        this.createCells();
        this.createBlocks(this.puzzle.data);
        this.draw();
        this.triggerChange();
    }

    draw () {
        this.createHtml();
        this.linkCells();
        this.drawCells();
    }

    createHtml () {
        const cell = this.puzzle.getTemplate('cell').html();
        this.$container.html([...this.cellList].fill(cell).join(''));
    }

    linkCells () {
        let index = 0;
        let $cells = this.$container.children();
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.cells[x][y].linkToElement($cells.eq(index++));
            }
        }
    }

    drawCells () {
        this.cellList.forEach(cell => cell.draw());
    }

    deleteByContext () {
        const block = this.getSelectedBlock();
        if (block?.word) {
            this.puzzle.toolbar.onRemoveBlockWord();
        } else if (block) {
            this.puzzle.toolbar.onDeleteBlock();
        }
    }

    deleteBlock (block) {
        const index = this.blocks.indexOf(block);
        if (index !== -1) {
            this.deselectBlock();
            block.clear();
            this.blocks.splice(index, 1);
        }
    }

    deleteAllBlocks () {
        this.deselectBlock();
        this.blocks.forEach(block => block.clear());
        this.blocks = [];
    }

    crop () {
        if (!this.isEmpty()) {
            const {left, top, right, bottom} = this.getBorders();
            this.moveBlocks(-left, -top);
            this.triggerChange();
            this.onResize(right - left + 1, bottom - top + 1);
        }
    }

    moveBlocks (dx, dy) {
        for (const block of this.blocks) {
            block.clearCells();
            block.draw();
        }
        for (const block of this.blocks) {
            block.offset(dx, dy);
            block.draw();
        }
    }

    canMoveBlocks (dx, dy) {
        const data = this.getBorders();
        return data.left + dx > -1
            && data.right + dx < this.width
            && data.top + dy > -1
            && data.bottom + dy < this.height;
    }

    getBorders () {
        const data = {
            left: -1,
            top: -1,
            right: -1,
            bottom: -1
        };
        this.cellList.forEach(cell => cell.resolveBlockBorders(data));
        return data;
    }

    getWords (except) {
        const words = this.blocks.map(({word}) => word);
        return words.filter(word => word && word !== except);
    }

    getClueByWord (target) {
        for (const {word, clue} of this.blocks) {
            if (word === target) {
                return clue;
            }
        }
    }

    removeWord (block) {
        block.removeWord();
        this.triggerWordSelect();
    }

    removeWords () {
        this.blocks.forEach(block => block.removeWord());
        this.triggerWordSelect();
    }

    exportData () {
        return this.blocks.map(block => block.exportData());
    }

    triggerChange () {
        return this.puzzle.triggerChange(...arguments)
    }

    triggerWordSelect () {
        return this.events.trigger(this.constructor.WORD_SELECT_EVENT);
    }

    triggerBlockSelect () {
        return this.events.trigger(this.constructor.BLOCK_SELECT_EVENT);
    }
}