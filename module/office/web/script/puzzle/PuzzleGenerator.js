/**
 * @copyright Copyright (c) 2023 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleGenerator {

    static MIN_BLOCK = 2;
    static MAX_BLOCK = 15;
    static MAX_PRIORITY = 10000;

    static WORKER_SCRIPT = document.currentScript.src.replace('PuzzleGenerator', 'PuzzleGeneratorWorker');

    constructor (puzzle) {
        this.puzzle = puzzle;
        this.grid = puzzle.grid;
        this.alert = puzzle.alert;
        this.running = false;
        this.timer = null;
        this.values = this.getDefaultValues();
    }

    getDefaultValues () {
        return {
            verticalSymmetry: true,
            size3: true,
            size4: true,
            size5: true,
            size6: true,
            size7: true,
            size8: true,
            size9: true,
            priority2: 20,
            priority3: 400,
            priority4: 1500,
            priority5: 3500,
            priority6: 4500,
            priority7: 5500,
            priority8: 6000,
            priority9: 5000,
            priority10: 4500,
            priority11: 3500,
            priority12: 3000,
            priority13: 1500,
            priority14: 1000,
            priority15: 500
        };
    }

    show () {
        const template = Jam.Helper.getTemplate('gridGeneratorForm');
        Jam.dialog.show(template, {
            css: 'primary',
            title: 'Grid generation parameters',
            submitText: 'Generate',
            beforeSubmit: this.onBeforeSubmit.bind(this),
            escaping: false
        });
        this.createForm();
    }

    createForm () {
        const $form = Jam.dialog.find('.form');
        this.form = new FormHandler($form, {
            onValidate: this.validate.bind(this)
        });
        this.form.init();
        this.form.setValues(this.values);
    }

    async onBeforeSubmit () {
        if (!this.form.validate()) {
            return false;
        }
        this.values = this.form.getValues();
        this.start();
        return true;
    }

    validate () {
        this.validatePriorities();
    }

    validatePriorities () {
        for (let i = PuzzleGenerator.MIN_BLOCK; i <= PuzzleGenerator.MAX_BLOCK; ++i) {
            this.validatePriority(i);
        }
    }

    validatePriority (size) {
        const max = PuzzleGenerator.MAX_PRIORITY;
        const name = `priority${size}`;
        const value = Number(this.form.getValue(name));
        if (!Number.isInteger(value)) {
            this.form.addError(name, Jam.t('Priority must be a integer'));
        } else if (value <= 0) {
            this.form.addError(name, Jam.t('Priority must be positive'));
        } else if (value > max) {
            this.form.addError(name, Jam.t(['Max priority is {max}', {max}]));
        }
    }

    start () {
        this.abort();
        this.worker = new Worker(this.constructor.WORKER_SCRIPT);
        this.worker.addEventListener('message', this.onWorkerMessage.bind(this), false);
        const data = this.getWorkerData();
        this.worker.postMessage(data);
        this.setRunning(true);
    }

    getWorkerData () {
        return {
            gridWidth: this.grid.width,
            gridHeight: this.grid.height,
            verticalSymmetry: this.values.verticalSymmetry,
            horizontalSymmetry: this.values.horizontalSymmetry,
            blocks: this.getWorkerBlocks()
        };
    }

    getWorkerBlocks () {
        let blocks = [];
        for (let size = PuzzleGenerator.MIN_BLOCK; size <= PuzzleGenerator.MAX_BLOCK; ++size) {
            let selected = this.form.getValue(`size${size}`);
            if (selected) {
                let priority = Number(this.form.getValue(`priority${size}`));
                blocks.push({size, priority});
            }
        }
        return blocks;
    }

    onWorkerMessage ({data}) {
        if (Array.isArray(data.blocks)) {
            const blocks = this.normalizeBlocks(data.blocks);
            this.grid.clear();
            this.grid.createBlocks(blocks);
            this.grid.draw();
            this.puzzle.triggerChange();
        }
        this.abort();
    }

    normalizeBlocks (items) {
        return items.map(({x, y, size, horizontal}) => {
            const cells = [];
            const dx = horizontal ? 1 : 0;
            const dy = horizontal ? 0 : 1;
            for (let i = 0; i < size; ++i) {
                cells.push([x, y]);
                x += dx;
                y += dy;
            }
            return {cells};
        });
    }

    abort () {
        if (this.running) {
            this.setRunning(false);
        }
        this.worker?.terminate();
    }

    setRunning (state) {
        this.puzzle.$container.toggleClass('generating', state);
        this.running = state;
    }
}