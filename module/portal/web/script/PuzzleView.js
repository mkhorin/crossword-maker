'use strict';

Portal.PuzzleView = {
    props: {
        puzzle: String
    },
    data () {
        return {
            error: false,
            loading: false,
            item: null
        };
    },
    computed: {
        loaded () {
            return !this.loading && !this.error;
        },
        studioUrl () {
            const base = 'office/model';
            const frame = `${base}/update?c=puzzle&id=${this.item?._id}`;
            return `${base}?n=_classes-puzzle.main&frame=${encodeURIComponent(frame)}`;
        }
    },
    async created () {
        await this.load();
    },
    methods: {
        async onCreatePdf () {
            try {
                this.loading = true;
                const {type} = this.item;
                const words = this.$refs.puzzle.getSourceWords();
                const clues = await this.$clues.getByWords(words);
                const Class = PdfExport.getClassByType(type);
                const job = new Class;
                await job.execute({
                    id: this.item._id,
                    title: this.item._title,
                    grid: this.item.grid,
                    theme: this.item.theme?._id,
                    clues
                });
            } catch {
                this.error = true;
            }
            this.loading = false;
        },
        async onResetPuzzle () {
            await Jam.dialog.confirm('Reset this puzzle?');
            this.$refs.puzzle.reset();
        },
        async load () {
            try {
                this.error = false;
                this.loading = true;
                this.item = await this.$fetch.json('read', {
                    class: 'puzzle',
                    view: 'public',
                    id: this.puzzle
                });
            } catch {
                this.error = true;
            }
            this.loading = false;
        }
    },
    template: '#puzzleView'
};