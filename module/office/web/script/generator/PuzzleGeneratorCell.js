/**
 * @copyright Copyright (c) 2023 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleGeneratorCell {

    constructor (data, block) {
        this.block = block;
        this.id = data.id;
        this.position = data.position;
        this.link = data.link;
    }

    connect () {
        this.link = this.block.worker.cellMap[this.link];
    }
}