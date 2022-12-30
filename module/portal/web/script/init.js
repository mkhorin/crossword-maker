'use strict';

const appId = '#portal';
const appParams = {...document.querySelector(appId).dataset};
const app = Vue.createApp(Portal, {
    userId: appParams.user
});
app.mixin(Portal.Mixin);

app.component('ajax-select', Portal.AjaxSelect);
app.component('breadcrumbs', Portal.Breadcrumbs);
app.component('modal-dialog', Portal.ModalDialog);
app.component('pagination', Portal.Pagination);
app.component('puzzle', Portal.Puzzle);
app.component('puzzle-clue', Portal.PuzzleClue);
app.component('puzzle-grid', Portal.PuzzleGrid);
app.component('puzzle-grid-cell', Portal.PuzzleGridCell);
app.component('puzzle-keyboard', Portal.PuzzleKeyboard);
app.component('puzzle-list', Portal.PuzzleList);
app.component('puzzle-view', Portal.PuzzleView);
app.component('puzzle-word', Portal.PuzzleWord);
app.component('puzzle-word-cell', Portal.PuzzleWordCell);

app.use(Portal.FetchService, appParams);
app.use(Portal.CluesService);
app.use(Portal.GridStorageService);

app.mount(appId);