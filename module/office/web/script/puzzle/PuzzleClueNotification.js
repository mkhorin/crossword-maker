/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleClueNotification {

    constructor ($container, puzzle) {
        this.puzzle = puzzle;
        this.grid = puzzle.grid;
        this.clues = puzzle.clues;
        this.$container = $container;
    }

    init () {
        this.puzzle.events.on(Puzzle.CHANGE_MODE_EVENT, this.onChangeMode.bind(this));
        this.grid.events.on(PuzzleGrid.BLOCK_SELECT_EVENT, this.onSelectBlock.bind(this));
        this.grid.events.on(PuzzleGrid.WORD_SELECT_EVENT, this.onSelectWord.bind(this));
        this.clues.events.on(PuzzleClues.CHANGE_EVENT, this.onChangeClues.bind(this));
    }

    onChangeMode () {
        this.$container.toggle(this.puzzle.isGridMode());
    }

    onSelectBlock () {
        this.update();
    }

    onSelectWord () {
        this.update();
    }

    onChangeClues () {
        this.update();
    }

    update () {
        const word = this.grid.getSelectedWord();
        const clues = this.clues.getWordClues(word);
        if (word && !clues) {
            this.clues.loadByWord(word);
        }
        const [type, message] = this.getContent(word, clues);
        this.$container.attr('type', type);
        this.$container.html(Jam.t(message));
    }

    getContent (word, clues) {
        if (!word) {
            return ['empty', 'Word is not selected'];
        }
        if (!clues) {
            return ['empty', 'Clues are not ready'];
        }
        if (!clues.length) {
            return ['warning', 'This word has no clue'];
        }
        const clue = PuzzleClues.getSelectedClue(clues) || clues[0];
        return ['default', clue.value];
    }
}