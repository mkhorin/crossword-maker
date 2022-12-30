/**
 * @copyright Copyright (c) 2022 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

class PuzzleHelper {

    static getClueById (id, clues) {
        if (Array.isArray(clues)) {
            return clues.find(({_id}) => _id === id);
        }
    }

    static getClue (clues, puzzle, theme) {
        if (!Array.isArray(clues)) {
            return null;
        }
        clues = this.filterClues(clues, theme);
        const hash = this.getStringHash(puzzle);
        const index = hash % clues.length;
        return clues[index];
    }

    static filterClues (clues, theme) {
        if (theme) {
            const themeClues = this.filterThemeClues(clues, theme);
            if (themeClues.length) {
                return themeClues;
            }
            return this.filterAnyThemeClues(clues);
        }
        const anyClues = this.filterAnyThemeClues(clues);
        return anyClues.length ? anyClues : clues;
    }

    static filterAnyThemeClues (clues) {
        return clues.filter(({themes}) => !themes?.length);
    }

    static filterThemeClues (clues, theme) {
        return clues.filter(clue => this.checkThemedClue(clue, theme));
    }

    static checkThemedClue ({themes}, theme) {
        if (Array.isArray(themes)) {
            for (const {theme: clueTheme} of themes) {
                if (clueTheme === theme) {
                    return true;
                }
            }
        }
        return false;
    }

    static getStringHash (text) {
        let hash = 0;
        if (typeof text === 'string') {
            for (let i = 0; i < text.length; ++i) {
                hash += text.charCodeAt(i);
            }
        }
        return hash;
    }
}