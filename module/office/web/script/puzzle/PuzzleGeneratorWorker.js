/**
 * @copyright Copyright (c) 2023 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

addEventListener('message', ({data}) => {
    const worker = new PuzzleGeneratorWorker(data);
    worker.execute();
    close();
}, false);

class PuzzleGeneratorWorker {

    static random (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    constructor (params) {
        this.params = params;
        this.gridWidth = params.gridWidth;
        this.gridHeight = params.gridHeight;
        this.gridWidthParity = this.gridWidth % 2;
        this.gridHeightParity = this.gridHeight % 2;
        this.gridHalfWidth = Math.floor(this.gridWidth / 2);
        this.gridHalfHeight = Math.floor(this.gridHeight / 2);
        this.gridWidthCenter = this.gridHalfWidth + this.gridWidthParity;
        this.gridHeightCenter = this.gridHalfHeight + this.gridHeightParity;
        this.verticalSymmetry = params.verticalSymmetry;
        this.horizontalSymmetry = params.horizontalSymmetry;
    }

    execute () {
        do {
            this.blocks = [];
            this.createCells();
            let blocks = this.getSourceBlocks();
            while (true) {
                let result = this.processBlocks(blocks);
                if (result === false) {
                    break;
                }
                if (result === true) {
                    blocks = this.getSourceBlocks();
                }
            }
        } while (!this.hasSymmetryLinks());

        if (this.verticalSymmetry) {
            this.createVerticalSymmetryBlocks();
        }
        if (this.horizontalSymmetry) {
            this.createHorizontalSymmetryBlocks();
        }
        postMessage({
            blocks: this.blocks
        });
    }

    createCells () {
        this.cells = [];
        for (let x = 0; x < this.gridWidth; ++x) {
            this.cells[x] = [];
            for (let y = 0; y < this.gridHeight; ++y) {
                this.cells[x][y] = {x, y};
            }
        }
    }

    getCell (x, y) {
        return this.cells[x]?.[y];
    }

    getSourceBlocks () {
        const blocks = [];
        for (const {size, priority} of this.params.blocks) {
            if (size <= this.gridWidth) {
                blocks.push({size, priority, horizontal: true});
            }
            if (size <= this.gridHeight) {
                blocks.push({size, priority, horizontal: false});
            }
        }
        return blocks;
    }

    processBlocks (blocks) {
        const index = this.getRandomBlockIndex(blocks);
        const block = blocks.splice(index, 1)[0];
        if (!block) {
            return false;
        }
        const cells = this.getBlockStartCells(block);
        if (cells.length) {
            const index = this.constructor.random(0, cells.length - 1);
            this.setBlock(block, cells[index]);
            this.blocks.push(block);
            return true;
        }
    }

    getRandomBlockIndex (blocks) {
        let total = 0;
        for (let {priority} of blocks) {
            total += priority;
        }
        let target = Math.random();
        let current = 0;
        for (let i = 0; i < blocks.length; ++i) {
            current += blocks[i].priority / total;
            if (current > target) {
                return i;
            }
        }
        return blocks.length - 1;
    }

    getBlockStartCells ({size, horizontal}) {
        let cells = [];
        let mx = this.gridWidth - 1;
        let my = this.gridHeight - 1;
        let dx, dy;
        if (horizontal) {
            dx = 1;
            dy = 0;
            mx -= size - 1;
        } else {
            dx = 0;
            dy = 1;
            my -= size - 1;
        }
        let halfSize = Math.floor(size / 2);
        let parity = size % 2;
        for (let x = 0; x <= mx; ++x) {
            for (let y = 0; y <= my; ++y) {
                if (this.canPlaceBlock(x, y, dx, dy, size, halfSize, parity)) {
                    cells.push(this.getCell(x, y));
                }
            }
        }
        return cells;
    }

    canPlaceBlock (x, y, dx, dy, size, halfSize, parity) {
        // new block must cross at least one block
        if (dx) { // horizontal block
            if (this.hasBlock(x - 1, y)) {
                return false;
            }
            if (this.hasBlock(x + size, y)) {
                return false;
            }
            if (this.verticalSymmetry) {
                // block cannot start in the right half
                if (x >= this.gridHalfWidth) {
                    return false;
                }
                // if parity of block and grid are not equal, then block cant intersect the center
                if (parity !== this.gridWidthParity) {
                    if (x + size >= this.gridWidthCenter) {
                        return false;
                    }
                // block can only cross the symmetry with its center
                } else if (x + size >= this.gridWidthCenter) {
                    if (x !== this.gridHalfWidth - halfSize) {
                        return false;
                    }
                }
            }
            if (this.horizontalSymmetry) {
                // block cannot be on the edge of symmetry of an even-width grid
                if (this.gridHeightParity) {
                    if (y > this.gridHalfHeight) {
                        return false;
                    }
                // block cannot start in the second half
                } else if (y + 1 >= this.gridHalfHeight) {
                    return false;
                }
            }
        } else { // vertical block
            if (this.hasBlock(x, y - 1)) {
                return false;
            }
            if (this.hasBlock(x, y + size)) {
                return false;
            }
            if (this.horizontalSymmetry) {
                if (y >= this.gridHalfHeight) {
                    return false;
                }
                if (parity !== this.gridHeightParity) {
                    if (y + size >= this.gridHeightCenter) {
                        return false;
                    }
                } else if (y + size >= this.gridHeightCenter) {
                    if (y !== this.gridHalfHeight - halfSize) {
                        return false;
                    }
                }
            }
            if (this.verticalSymmetry) {
                if (this.gridWidthParity) {
                    if (x > this.gridHalfWidth) {
                        return false;
                    }
                } else if (x + 1 >= this.gridHalfWidth) {
                    return false;
                }
            }
        }
        if (!this.blocks.length) {
            return true;
        }
        let intersections = 0;
        for (let i = 0; i < size; ++i) {
            let cell = this.getCell(x, y);
            if (dx) { // horizontal block
                let cell = this.getCell(x, y);
                if (cell.horizontal) {
                    return false;
                }
                if (cell.vertical) {
                    intersections += 1;
                } else if (this.hasBlock(x, y - 1)) {
                    return false;
                } else if (this.hasBlock(x, y + 1)) {
                    return false;
                }
            } else { // vertical block
                let cell = this.getCell(x, y);
                if (cell.vertical) {
                    return false;
                }
                if (cell.horizontal) {
                    intersections += 1;
                } else if (this.hasBlock(x - 1, y)) {
                    return false;
                } else if (this.hasBlock(x + 1, y)) {
                    return false;
                }
            }
            x += dx;
            y += dy;
        }
        return intersections > 0;
    }

    hasBlock (x, y) {
        const cell = this.getCell(x, y);
        return cell?.horizontal || cell?.vertical;
    }

    setBlock (block, {x, y}) {
        block.x = x;
        block.y = y;
        let {horizontal} = block;
        let dx = horizontal ? 1 : 0;
        let dy = horizontal ? 0 : 1;
        for (let i = 0; i < block.size; ++i) {
            let cell = this.getCell(x, y);
            if (horizontal) {
                cell.horizontal = true;
            } else {
                cell.vertical = true;
            }
            x += dx;
            y += dy;
        }
        return block;
    }

    hasSymmetryLinks () {
        // at least one linking block is required for each symmetry
        let hasHorizontalLink = !this.verticalSymmetry;
        let hasVerticalLink = !this.horizontalSymmetry;
        for (let {x, y, size, horizontal} of this.blocks) {
            if (horizontal) {
                if (x + size >= this.gridWidthCenter) {
                    hasHorizontalLink = true;
                }
            } else if (y + size >= this.gridHeightCenter) {
                hasVerticalLink = true;
            }
        }
        return hasVerticalLink && hasHorizontalLink;
    }

    createVerticalSymmetryBlocks () {
        const blocks = [];
        for (const {x, y, size, horizontal} of this.blocks) {
            if (horizontal) {
                if (x + size >= this.gridWidthCenter) {
                    continue;
                }
                const cell = this.getCell(this.gridWidth - x - size, y);
                const block = this.setBlock({size, horizontal}, cell);
                blocks.push(block);
            } else if (x !== this.gridHalfWidth) { // except center block
                const cell = this.getCell(this.gridWidth - x - 1, y);
                const block = this.setBlock({size, horizontal}, cell);
                blocks.push(block);
            }
        }
        this.blocks.push(...blocks);
    }

    createHorizontalSymmetryBlocks () {
        const blocks = [];
        for (const {x, y, size, horizontal} of this.blocks) {
            if (!horizontal) {
                if (y + size >= this.gridHeightCenter) {
                    continue;
                }
                const cell = this.getCell(x, this.gridHeight - y - size);
                const block = this.setBlock({size, horizontal}, cell);
                blocks.push(block);
            } else if (y !== this.gridHalfHeight) { // except center block
                const cell = this.getCell(x, this.gridHeight - y - 1);
                const block = this.setBlock({size, horizontal}, cell);
                blocks.push(block);
            }
        }
        this.blocks.push(...blocks);
    }
}