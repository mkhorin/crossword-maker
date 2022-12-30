/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleSolverCluster {

    static createAll (solver) {
        const clusters = [];
        for (const block of solver.blocks) {
            if (!block.cluster) {
                clusters.push(this.create(block));
            }
        }
        return clusters;
    }

    static create (block) {
        const cluster = new this(block);
        cluster.resolve();
        return cluster;
    }

    constructor (block) {
        this.block = block;
    }

    resolve () {
        const blocks = [this.block];
        this.block.cluster = this;
        for (let i = 0; i < blocks.length; ++i) {
            for (let {link: {block}} of blocks[i].cells) {
                if (!block.cluster) {
                    blocks.push(block);
                    block.cluster = this;
                }
            }
        }
        this.blocks = blocks;
    }
}