/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleToolbar {

    constructor ($container, puzzle) {
        this.puzzle = puzzle;
        this.alert = puzzle.alert;
        this.grid = puzzle.grid;
        this.$container = $container;
    }

    init () {
        this.$container.on('click', '[data-action]', this.onAction.bind(this));
    }

    getAction (name) {
        return this.$container.find(`[data-action="${name}"]`);
    }

    async onAction (event) {
        const $action = $(event.currentTarget);
        this.toggleRadioGroup($action);
        this.alert.hide();

        switch ($action.data('action')) {
            case 'createClue': await this.onCreateClue(); break;
            case 'cropByContent': await this.onCropByContent(); break;
            case 'deleteAllBlocks': await this.onDeleteAllBlocks(); break;
            case 'deleteClue': await this.onDeleteClue(); break;
            case 'deleteBlock': await this.onDeleteBlock(); break;
            case 'editClue': await this.onEditClue(); break;
            case 'findEmptyBlock': await this.onFindEmptyBlock(); break;

            case 'filterAnyClue': await this.onFilterAnyClue(); break;
            case 'filterWithoutClue': await this.onFilterWithoutClue(); break;
            case 'filterUnselectedClue': await this.onFilterUnselectedClue(); break;
            case 'filterMultipleClue': await this.onFilterMultipleClue(); break;

            case 'moveDown': await this.onMoveDown(); break;
            case 'moveLeft': await this.onMoveLeft(); break;
            case 'moveRight': await this.onMoveRight(); break;
            case 'moveUp': await this.onMoveUp(); break;

            case 'startAutoFilling': await this.onStartAutoFilling(); break;
            case 'abortAutoFilling': await this.onAbortAutoFilling(); break;
            case 'clearAutoFilling': await this.onClearAutoFilling(); break;

            case 'reloadClues': await this.onReloadClues(); break;
            case 'removeAllBlockWords': await this.onRemoveAllBlockWords(); break;
            case 'removeBlockWord': await this.onRemoveBlockWord(); break;
            case 'showGrid': await this.onShowGrid(); break;
            case 'showClues': await this.onShowClues(); break;
        }
        $action.blur();
    }

    onCreateClue () {
        const word = this.puzzle.gridWords.getSelectedWord();
        if (!word) {
            return this.warning('Select a word');
        }
        this.puzzle.clues.create(word);
    }

    onEditClue () {
        const clue = this.puzzle.clues.getSelectedClue();
        if (!clue) {
            return this.warning('Select a clue');
        }
        this.puzzle.clues.edit(clue);
    }

    async onDeleteClue () {
        const clue = this.puzzle.clues.getSelectedClue();
        if (!clue) {
            return this.warning('Select a clue');
        }
        await Jam.dialog.confirmDeletion('Delete the selected clue?');
        this.puzzle.clues.delete(clue);
    }

    onCropByContent () {
        if (this.hasBlocks()) {
            this.grid.crop();
        }
    }

    onDeleteBlock () {
        const block = this.grid.getSelectedBlock();
        if (!block) {
            return this.warning('Select a block');
        }
        this.grid.deleteBlock(block);
        this.triggerChange();
    }

    async onDeleteAllBlocks () {
        if (this.hasBlocks()) {
            await Jam.dialog.confirmDeletion('Delete all blocks?');
            this.grid.deleteAllBlocks();
            this.triggerChange();
        }
    }

    onFindEmptyBlock () {
        const blocks = this.grid.getEmptyBlocks();
        if (!blocks.length) {
            return this.warning('There is no empty block');
        }
        this.grid.selectBlock(blocks[0]);
    }

    onFilterAnyClue () {
        this.puzzle.gridWords.setAnyClueFilter();
    }

    onFilterMultipleClue () {
        this.puzzle.gridWords.setMultipleClueFilter();
    }

    onFilterUnselectedClue () {
        this.puzzle.gridWords.setUnselectedClueFilter();
    }

    onFilterWithoutClue () {
        this.puzzle.gridWords.setWithoutClueFilter();
    }

    onMoveLeft () {
        this.moveBlocks(-1, 0);
    }

    onMoveRight () {
        this.moveBlocks(1, 0);
    }

    onMoveUp () {
        this.moveBlocks(0, -1);
    }

    onMoveDown () {
        this.moveBlocks(0, 1);
    }

    onReloadClues () {
        this.puzzle.clues.reload();
    }

    onRemoveBlockWord () {
        const block = this.grid.getSelectedBlock();
        if (!block) {
            return this.warning('Select a block');
        }
        this.grid.removeWord(block);
        this.triggerChange();
    }

    async onRemoveAllBlockWords () {
        if (this.hasBlocks()) {
            await Jam.dialog.confirmDeletion('Remove all words?', {
                submitText: 'Remove'
            });
            this.grid.removeWords();
            this.triggerChange();
        }
    }

    onShowGrid () {
        this.puzzle.setMode(Puzzle.GRID_MODE);
    }

    onShowClues () {
        this.puzzle.setMode(Puzzle.CLUE_MODE);
    }

    onStartAutoFilling () {
        this.puzzle.solver.start();
    }

    onAbortAutoFilling () {
        this.puzzle.solver.abort();
    }

    onClearAutoFilling () {
        this.puzzle.solver.clearGrid();
    }

    moveBlocks (dx, dy) {
        if (this.hasBlocks() && this.grid.canMoveBlocks(dx, dy)) {
            this.grid.moveBlocks(dx, dy);
            this.triggerChange();
        }
    }

    hasBlocks () {
        if (!this.grid.isEmpty()) {
            return true;
        }
        this.warning('Has no blocks');
    }

    warning () {
        this.alert.warning(...arguments);
    }

    triggerChange () {
        return this.puzzle.triggerChange(...arguments);
    }

    toggleRadioGroup ($action) {
        const $group = $action.closest('.radio-btn-group');
        if ($group.length) {
            $group.find('.active').removeClass('active');
            $action.addClass('active');
        }
    }
}