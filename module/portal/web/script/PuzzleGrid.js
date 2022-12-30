'use strict';

Portal.PuzzleGrid = {
    emits: ['select'],
    props: {
        puzzle: String,
        grid: Array
    },
    data () {
        return {
            cells: [],
            width: 0,
            height: 0
        };
    },
    computed: {
        style () {
            return {
                height: `calc(var(--cell-size) * ${this.height}`,
                width: `calc(var(--cell-size) * ${this.width})`
            };
        }
    },
    created () {
        this.blocks = this.createBlocks();
        this.normalizeCellOffset();
        this.$gridStorage.restore(this.puzzle, this.blocks);
    },
    methods: {
        onCell ({block1, block2}) {
            const current = this.getSelectedBlock();
            current?.toggleSelect(false);
            const target = block2 && current?.id === block1.id ? block2 : block1;
            target.toggleSelect(true);
            this.$emit('select', target);
        },
        getSelectedBlock () {
            return this.blocks.find(({selected}) => selected);
        },
        createBlocks () {
            return this.grid.map((data, index) => {
                const block = new Portal.PuzzleGridBlock(index, data);
                const cells = this.createCellsByPositions(data.cells);
                block.setCells(cells);
                return block;
            });
        },
        createCellsByPositions (positions) {
            return positions.map(([x, y]) => {
                if (!this.getCellByPosition(x, y)) {
                    this.createCell(x, y)
                }
                return this.getCellByPosition(x, y);
            });
        },
        getCellByPosition (tx, ty) {
            return this.cells.find(({x, y}) => x === tx && y === ty);
        },
        createCell (x, y) {
            const selected = false;
            const letter = null;
            const cell = {x, y, selected, letter};
            this.cells.push(cell);
            return cell;
        },
        normalizeCellOffset () {
            const [left, top, right, bottom] = this.getBorderRect();
            this.cells.forEach(cell => {
               cell.x -= left;
               cell.y -= top;
            });
            this.width = right - left + 1;
            this.height = bottom - top + 1;
        },
        getBorderRect () {
            let left = Number.MAX_SAFE_INTEGER;
            let top = Number.MAX_SAFE_INTEGER;
            let right = 0;
            let bottom = 0;
            for (const {x, y} of this.cells) {
                if (x < left) left = x;
                if (x > right) right = x;
                if (y < top) top = y;
                if (y > bottom) bottom = y;
            }
            return [left, top, right, bottom];
        },
        getSourceWords () {
            return this.blocks.map(({sourceWord}) => sourceWord).filter(v => v);
        },
        setWord (word) {
            this.getSelectedBlock()?.setWord(word);
            this.$gridStorage.save(this.puzzle, this.blocks);
        },
        reset () {
            this.blocks.forEach(block => block.clearWord());
            this.$gridStorage.clear(this.puzzle);
        }
    },
    template: '#puzzleGrid'
};