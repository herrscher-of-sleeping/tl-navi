const patchHelp = `Формат:
add x1,y1,z1 to x2,y2,z2
delete x,y,z

Координата 'y' опциональна и может быть пропущена:
add 42,42 to 5000, 6000
delete 123,4536

Любая другая строка просто игнорируется.
`;

const infoPopup = `<h1>TL-Navi</h1>
Это калькулятор маршрутов через транслокаторы Vintage Story. Вы вводите "откуда" и "куда", и он находит маршрут.

<h2>Как это работает</h2>
Калькулятор читает файл "translocators.geojson" (см. ниже), чтобы получить список транслокаторов.
Затем строит дерево квадрантов с транслокаторами в качестве точек, и граф, где каждый узел — это транслокатор.
Соединяет парные транслокаторы с выбранным весом, с помощью дерева квадрантов ищет ближайшие транслокаторы, и соединяет их, используя расстояние в качестве веса на графе.
Добавляет начальную и конечную точки маршрута, соединяет их со всеми другими узлами графа чтобы гарантировать наличие маршрута, и использует алгоритм Дейкстры для поиска кратчайшего маршрута.

<h2>Откуда берутся данные?</h2>
Файл translocators.geojson создаётся модом <a href="https://mods.vintagestory.at/wc">Web-cartographer</a>, который экспортирует данные для онлайн-карты.
Если сервер не ваш, но у него есть онлайн-карта, вы можете скачать файл по относительному пути data/geojson/translocators.geojson.
Например, на TOPS: <a href="https://map.tops.vintagestory.at/data/geojson/translocators.geojson">https://map.tops.vintagestory.at/data/geojson/translocators.geojson</a>.
Опционально также используется файл landmarks.geojson file (data/geojson/landmarks.geojson), чтобы можно было выбирать отметки на карте.

<h2>Добавление данных для сервера</h2>
Если вы играете на сервере, который не представлен здесь, но у которого есть онлайн-карта, вы можете вручную добавить настройки для сервера (они сохраняются в локальных данных браузера).
Для этого нажмите на шестерёнку справа от выбора сервера.

<h2>Ограничения</h2>
Карта показывается в элементе <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe">iframe</a>, поэтому некоторые взаимодействия сделать невозможно в рамках браузера
(без поднятия собственного зеркала карты или без изменения настроек сервера с картой).
Также используется статический хостинг GitHub Pages, поэтому здесь нет серверной логики.
Многие неудобства (вроде невозможности нормально показывать маршрут на карте; невозможности автоматически скачать translocators.geojson с сайта карты, и т.д.) происходят отсюда. Когда-нибудь я это исправлю, но не сегодня.

<h2>Чей это проект?</h2>
RaidenFumo, чаще всего играю на TOPS.

<h3>Контакты</h3>
Discord: @raiden_fumo<br>
E-mail: <a href="mailto:herrscher.of.the.tea@gmail.com">herrscher.of.the.tea@gmail.com</a><br>
GitHub: <a href="https://github.com/herrscher-of-sleeping">https://github.com/herrscher-of-sleeping</a><br>
<br>
Используйте любой из этих контактов для баг-репортов, советов; чтобы порекомендовать добавить сервер в список по умолчанию, и т.д.

<h2>Лицензии</h2>
Проект доступен под открытой лицензией MIT, исходный код <a href="https://github.com/herrscher-of-sleeping/tl-navi">доступен на GitHub</a>.
Используются библиотеки Vue, Vue-Multiselect, Dexie, i18next, Vue-i18next. Для полной информации о лицензиях см. <a href="dependencies.html">Licenses</a>.
<br>
<br>
`;

export default {
    "server_editor.webmap_link": "Ссылка на онлайн-карту:",
    "server_editor.server_name": "Название:",
    "server_editor.translocators_patch": "Патч для списка транслокаторов:",
    "server_editor.translocators_geojson": "translocators.geojson:",
    "server_editor.landmarks_geojson": "landmarks.geojson:",
    "server_editor.download": "скачать",
    "server_editor.clear": "Очистить",
    "server_editor.delete": "Удалить",
    "server_editor.save": "Сохранить",
    "server_editor.cancel": "Отменить",
    "server_editor.configure_servers": "Настроить список серверов",
    "server_editor.patch_help": patchHelp,
    "app.server": "Сервер:",
    "app.from_coords": "Откуда:",
    "app.to_coords": "Куда:",
    "app.more_teleporting": "Больше телепортаций",
    "app.more_walking": "больше ходьбы.",
    "app.translocator_weight": "Вес телепортации ",
    "app.weight_help_zero": "0 значит, что вы не хотите дополнительной ходьбы",
    "app.weight_help_nonzero": "Вы готовы дополнительно пройти {{weight}} блоков, чтобы не телепортироваться лишний раз",
    "app.calculate": "Поехали",

    "path_output.translocator_jumps__zero": "{{count}} телепортаций",
    "path_output.translocator_jumps__one": "{{count}} телепортация",
    "path_output.translocator_jumps__few": "{{count}} телепортации",
    "path_output.translocator_jumps__many": "{{count}} телепортаций",
    "path_output.translocator_jumps__other": "{{count}} телепортаций",
    "path_output.approximate_walk_distance": "приблизительное расстояние ходьбы:",
    "path_output.blocks__zero": "{{count}} блоков",
    "path_output.blocks__one": "{{count}} блок",
    "path_output.blocks__few": "{{count}} блока",
    "path_output.blocks__many": "{{count}} блоков",
    "path_output.blocks__other": "{{count}} блоков",
    "path_output.show_tl_depths": "Показать глубину транслокаторов:",
    "path_output.walk": "Пройти",
    "path_output.blocks_from__zero": "блоков от",
    "path_output.blocks_from__one": "блок от",
    "path_output.blocks_from__few": "блока от",
    "path_output.blocks_from__many": "блоков от",
    "path_output.blocks_from__other": "блоков от",
    "path_output.to": "к",
    "path_output.copy_waypoint": "Скопировать команду /waypoint",
    "path_output.map_url_not_set": "URL карты не задан в настройках",
    "info_popup.text": infoPopup,
    "info_popup.close": "Закрыть"
}
