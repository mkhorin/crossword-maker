'use strict';

Portal.AjaxSelect = {
    emits: [
        'change'
    ],
    props: {
        class: String,
        view: String,
        placeholder: String
    },
    data () {
        return {
            items: [],
            value: ''
        };
    },
    async created () {
        await this.load();
    },
    methods: {
        async load () {
            const data = await this.$fetch.json('list', {
                class: this.class,
                view: this.view
            });
            this.items = data.items;
        },
        onChange () {
            this.$emit('change', this.value);
        }
    },
    template: '#ajaxSelect'
};