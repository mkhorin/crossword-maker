/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleSolverCell {

    constructor (position, source, block) {
        this.position = position;
        this.source = source;
        this.block = block;
        this.free = block.free;
    }

    getId () {
        return `${this.block.id}.${this.source.x}.${this.source.y}`;
    }

    getLetter () {
        return this.block.word[this.position];
    }

    connect () {
        const sourceCrossBlock = this.source.getCrossBlock(this.block.source);
        const crossBlock = this.block.solver.getBlockBySource(sourceCrossBlock);
        this.link = crossBlock.getCellBySource(this.source);
    }

    getWorkerData () {
        return {
            id: this.getId(),
            position: this.position,
            link: this.link.getId()
        };
    }
}