/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleWorkerBlock {

    constructor (data, worker) {
        this.worker = worker;
        this.word = null;
        this.words = data.words;
        this.cells = this.createCells(data.cells);
    }

    createCells (items) {
        return items.map(item => new PuzzleWorkerCell(item, this));
    }

    connectCells () {
        this.cells.forEach(cell => cell.connect());
    }
}