/**
 * @copyright Copyright (c) 2023 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleGeneratorBlock {

    constructor (data, worker) {
        this.worker = worker;
        this.word = null;
        this.words = data.words;
        this.cells = this.createCells(data.cells);
    }

    createCells (items) {
        return items.map(item => new PuzzleGeneratorCell(item, this));
    }

    connectCells () {
        this.cells.forEach(cell => cell.connect());
    }
}