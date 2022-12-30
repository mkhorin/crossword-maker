/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleSolver {

    static WORKER_SCRIPT = document.currentScript.src.replace('PuzzleSolver', 'PuzzleWorker');

    constructor (puzzle) {
        this.puzzle = puzzle;
        this.grid = puzzle.grid;
        this.dictionary = puzzle.dictionary;
        this.alert = puzzle.alert;
        this.running = false;
        this.timer = null;
        this.blocks = [];
        this.fixedBlocks = [];
        this.freeBlocks = [];
    }

    start () {
        this.createBlocks();
        this.setFixedBlocks();
        this.setFreeBlocks();
        this.connectCells();
        this.prepareWords();
        if (this.getUnsolvableBlock()) {
            this.alertError();
            this.abort();
        } else {
            this.startWorker();
        }
    }

    createBlocks () {
        this.blocks = this.grid.blocks.map((source, index) => {
            return new PuzzleSolverBlock(index, source, this);
        });
    }

    setFixedBlocks () {
        this.fixedBlocks = this.blocks.filter(block => !block.free);
    }

    setFreeBlocks () {
        this.freeBlocks = this.blocks.filter(block => block.free);
    }

    connectCells () {
        this.blocks.forEach(block => block.connectCells());
    }

    prepareWords () {
        const usedWords = this.fixedBlocks.map(({word}) => word);
        for (const block of this.freeBlocks) {
            block.setWordsBySize();
            block.setWordsByFixedLinks();
            block.removeWords(usedWords);
        }
        while (this.prepareWordsByLinks()) {}

    }

    prepareWordsByLinks () {
        let changed = false;
        for (let block of this.freeBlocks) {
            if (block.setWordsByLinks()) {
                changed = true;
            }
        }
        return changed;
    }

    getBlockBySource (source) {
        return this.blocks.find(block => block.source === source);
    }

    getUnsolvableBlock () {
        return this.freeBlocks.find(({words}) => !words.length);
    }

    startWorker () {
        this.abort();
        this.worker = new Worker(this.constructor.WORKER_SCRIPT);
        this.worker.addEventListener('message', this.onWorkerMessage.bind(this), false);
        const data = this.getWorkerData();
        this.worker.postMessage(data);
        this.setRunning(true);
    }

    getWorkerData () {
        return this.freeBlocks.map(block => block.getWorkerData());
    }

    onWorkerMessage ({data}) {
        switch (data.type) {
            case 'progress': return this.onWorkerProgress(data);
            case 'result': return this.onWorkerResult(data);
        }
        this.abort();
    }

    onWorkerProgress ({words}) {
        this.assignToGrid(words);
    }

    onWorkerResult ({words}) {
        const nulls = words.filter(word => !word);
        if (nulls.length) {
            this.alertError();
        } else {
            this.assignToGrid(words);
            this.puzzle.triggerChange();
            this.setRunning(false);
        }
        this.abort();
        this.grid.triggerBlockSelect();
    }

    abort () {
        if (this.running) {
            this.clearGrid();
            this.setRunning(false);
        }
        this.worker?.terminate();
    }

    alertError () {
        this.alert.danger('This grid cannot be filled');
    }

    setRunning (state) {
        this.puzzle.$container.toggleClass('auto-filling', state);
        this.running = state;
    }

    assignToGrid (words) {
        this.freeBlocks.forEach((block, index) => {
            block.source.word = words[index];
        });
        this.grid.drawCells();
    }

    clearGrid () {
        for (const {source} of this.freeBlocks) {
            if (this.grid.blocks.includes(source)) {
                source.removeWord();
            }
        }
        this.grid.triggerWordSelect();
    }
}