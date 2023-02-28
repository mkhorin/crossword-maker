/**
 * @copyright Copyright (c) 2023 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

addEventListener('message', ({data}) => {
    importScripts('PuzzleGeneratorBlock.js', 'PuzzleGeneratorCell.js');
    const worker = new PuzzleGeneratorWorker(data);
    worker.execute();
    close();
}, false);

class PuzzleGeneratorWorker {

    static PROGRESS_DELAY = 250;

    constructor (data) {
        this.data = data;
    }

    createBlocks (items) {
        this.blocks = items.map(item => new PuzzleWorkerBlock(item, this));
    }

    connectCells () {
        this.createCellMap();
        this.blocks.forEach(block => block.connectCells());
    }

    createCellMap () {
        this.cellMap = {};
        for (const {cells} of this.blocks) {
            for (const cell of cells) {
                this.cellMap[cell.id] = cell;
            }
        }
    }

    execute () {
        this.setProgressTime();
        this.createBlocks(this.data);
        this.connectCells();
        this.resolveWords();
        this.sendMessage('result');
    }

    setProgressTime () {
        this.progressTime = Date.now() + this.constructor.PROGRESS_DELAY;
    }

    sendProgress () {
        this.sendMessage('progress');
    }

    sendMessage (type) {
        const words = this.blocks.map(({word}) => word);
        postMessage({type, words});
    }

    resolveWords () {
        this.usedWordMap = {};
        const blocks = this.sortBlocks();
        for (const block of blocks) {
            this.resolveBlockWord(block);
        }
    }

    sortBlocks () {
        return [...this.blocks].sort((a, b) => {
            return a.words.length === b.words.length
                ? b.cells.length - a.cells.length // desc
                : a.words.length - b.words.length; // asc
        });
    }

    resolveBlockWord (block) {
        const words = this.filterBlockWords(block);
        while (words.length) {
            const index = Math.floor(Math.random() * words.length);
            const word = words[index];
            words.splice(index, 1);
            this.usedWordMap[word] = true;
            block.word = word;
            const resolvedBlocks = [block];
            if (this.resolveLinkedWords(resolvedBlocks)) {
                return resolvedBlocks;
            }
            for (const block of resolvedBlocks) {
                this.usedWordMap[block.word] = false;
                block.word = null;
            }
        }
        if (this.progressTime < Date.now()) {
            this.sendProgress();
            this.setProgressTime();
        }
    }

    resolveLinkedWords (resolvedBlocks) {
        for (const {link} of resolvedBlocks[0].cells) {
            if (!link.block.word) {
                const blocks = this.resolveBlockWord(link.block);
                if (!blocks) {
                    return false;
                }
                resolvedBlocks.push(...blocks);
            }
        }
        return true;
    }

    filterBlockWords ({words, cells}) {
        words = words.filter(word => this.usedWordMap[word] !== true);
        for (let {link, position} of cells) {
            if (link.block.word) {
                const letter = link.block.word[link.position];
                words = words.filter(word => word[position] === letter);
            }
        }
        return words;
    }
}