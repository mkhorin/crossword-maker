'use strict';
/**
 * Extend default translations
 *
 * Use: Jam.t('Some text')
 * Use: <span data-t="">Some text</span>
 * Use: <div title="Some text" data-t=""></div>
 * Use: <input placeholder="Some text" type="text" data-t="">
 */
Object.assign(Jam.I18n.defaults, {

    'Across:': 'По горизонтали:',

    'Block size': 'Размер блока',

    'Cancel': 'Отменить',
    'Cell font factor': 'Коэффициент шрифта клетки',
    'Clues are not ready': 'Подсказки не готовы',
    'Clues on a new page': 'Подсказки на новой странице',
    'Clue with line break': 'Подсказка с новой строки',

    'Data format (clues are optional):': 'Формат данных (подсказки необязательны)',
    'Delete all blocks?': 'Удалить все блоки?',
    'Delete the selected clue?': 'Удалить выбранную подсказку?',
    'Down:': 'По вертикали:',

    'Export': 'Экспортировать',
    'Export to PDF': 'Экспорт в PDF',
    'Export words': 'Экспортировать слова',

    'Generate': 'Генерировать',
    'Grid generation parameters': 'Параметры генерации сетки',
    'Grid is empty': 'Сетка кроссворда пустая',

    'Horizontal symmetry': 'Горизонтальная симметрия',

    'Import words': 'Импортировать слова',
    'Input a new clue': 'Введите новую подсказку',
    'Invalid clue': 'Некорректная подсказка',
    'Invalid grid': 'Некорректная сетка кроссворда',
    'Invalid word': 'Некорректное слово',

    'Landscape': 'Альбом',

    'Max block size': 'Максимальный размер блока',
    'Max cell size': 'Максимальный размер клетки',
    'Max priority is {max}': 'Максимальный приоритет - {max}',
    'Min block size': 'Минимальный размер блока',
    'Min size must be greater than or equal to max': 'Минимальный размер не более максимального',

    'No puzzles found': 'Кроссворды не найдены',

    'Page format': 'Формат страницы',
    'Page margin': 'Поля страницы',
    'Page orientation': 'Ориентация',
    'Portal': 'Портал',
    'Portrait': 'Портрет',
    'Priority': 'Приоритет',
    'Priority must be a integer': 'Приоритет должен быть целым',
    'Priority must be positive': 'Приоритет должен быть положительным',

    'Remove all words?': 'Удалить все слова?',

    'Select a clue': 'Выберите подсказку',
    'Select a word': 'Выберите слово',
    'Show answers': 'Показать ответы',
    'Size must be no greater than {size}': 'Размер должен быть не более {size}',
    'Size must be at least {size}': 'Размер должен быть не менее {size}',
    'Skip new words': 'Пропускать новые слова',
    'Starts with...': 'Начинается с...',

    'Text size': 'Размер текста',
    'There is empty grid block': 'В кроссворде есть пустой блок',
    'This grid cannot be filled': 'Эта сетка не может быть заполнена',
    'This word has no clue': 'Это слово не имеет подсказки',
    'Too many words (max {max})': 'Слишком много слов (макс. {max})',

    'Vertical symmetry': 'Вертикальная симметрия',

    'Word is not selected': 'Слово не выбрано',

    'word1': 'слово1',
    'word2; clue1; clue2': 'слово2; подсказка1; подсказка2',
});
/**
 * Metadata translation category
 *
 * meta - any metadata
 * meta.class.className - class metadata
 * meta.class.className.view.viewName - class view metadata
 */
Jam.I18n.meta = {

    'Abort auto filling': 'Прервать автозаполнение',
    'Abort generation': 'Прервать генерацию',
    'All': 'Все',
    'Any word or clue can be associated with several themes': 'Любое слово или подсказка могут быть связаны с несколькими темами',
    'Auto filling...': 'Автозаполнение...',

    'Classic': 'Классический',
    'Clear last auto filling': 'Очистить последнее автозаполнение',
    'Clue': 'Подсказка',
    'Clues': 'Подсказки',
    'Code': 'Код',
    'Create clue': 'Создать подсказку',
    'Crop by content': 'Обрезать по содержимому',

    'Delete all blocks': 'Удалить все блок',
    'Delete block': 'Удалить блок',
    'Delete clue': 'Удалить подсказку',
    'Description': 'Описание',

    'Edit clue': 'Редактировать подсказку',
    'Edit puzzle': 'Редактировать кроссворд',
    'English words': 'Английские слова',

    'Generate grid': 'Генерировать сетку',
    'Grid': 'Сетка',
    'Grid is being generated...': 'Генерация сетки...',

    'Height': 'Высота',

    'Find empty block': 'Найти пустой блок',

    'In English language': 'На английском языке',
    'In Russian language': 'На русском языке',

    'Language': 'Язык',
    'Languages': 'Языки',
    'Link clue to theme': 'Привязать подсказку к теме',
    'Link word to theme': 'Привязать слово к теме',

    'Move grid down': 'Сдвинуть сетку вниз',
    'Move grid left': 'Сдвинуть сетку влево',
    'Move grid right': 'Сдвинуть сетку вправо',
    'Move grid up': 'Сдвинуть сетку вверх',
    'Multiple clues': 'Несколько подсказок',

    'Name': 'Название',

    'Published': 'Опубликовано',
    'Puzzle': 'Кроссворд',
    'Puzzles': 'Кроссворды',

    'Reload clues': 'Перезагрузить подсказки',
    'Remove all words': 'Удалить все слова',
    'Remove word': 'Удалить слово',
    'Russian words': 'Русские слова',

    'Scandinavian': 'Скандинавский',
    'Start auto filling': 'Начать автозаполнение',

    'Theme': 'Тема',
    'Themes': 'Темы',
    'Type': 'Тип',

    'Unselected clue': 'Невыбранная подсказка',

    'Value': 'Значение',

    'Width': 'Ширина',
    'Without clue': 'Без подсказки',
    'Word': 'Слово',
    'Word pattern': 'Шаблон слова',
    'Words': 'Слова',
    'Words with multiple clues': 'Слова с несколькими подсказками',
};