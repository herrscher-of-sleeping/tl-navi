const patchHelp = `Format:
add x1,y1,z1 to x2,y2,z2
delete x,y,z

'y' is optional and can be omitted:
add 42,42 to 5000, 6000
delete 123,4536

Any other line is simply ignored.
`;

const infoPopup = `<h1>TL-Navi</h1>
This is a route calculator for Vintage Story translocators. Like Google maps when it shows you what buses to take from point A to point B, but this tool shows what translocators you can use to travel.
You enter "from" and "to" locations, click "Calculate" (or press Enter), and it finds the route for you. You can also change translocator weight: value of 50 means you'd walk 50 meters rather than have a teleportation, so higher values will result with more walking and less teleporting.

<h2>How does it work</h2>
It reads "translocators.geojson" file (see below) to get positions of known translocators.
Then it builds a quad tree with all the translocators, uses it to build a graph in which every node is a translocator,
and each node is connected to its neighbours (other translocators in a small walkable radius or just closest translocators if there are none nearby; edge weight is a distance you'll have to walk) or to its pair translocator (that's where translocator weight is used),
adds start and end points as nodes and connects them to every other node. Then it uses Dijkstra's algorithm to find a route.

<h2>Where does the data come from</h2>
This calculator uses "translocators.geojson" file as provided by <a href="https://mods.vintagestory.at/wc">Web-cartographer mod</a> to get positions of known translocators.
If you're not the server owner, but the server has a web-map, you can download it from there at relative path data/geojson/translocators.geojson. For example, link for TOPS: <a href="https://map.tops.vintagestory.at/data/geojson/translocators.geojson">https://map.tops.vintagestory.at/data/geojson/translocators.geojson</a>.
Optionally it also uses landmarks.geojson file (data/geojson/landmarks.geojson) to allow searching for landmarks.

<h2>Adding server data</h2>
If you're playing on a server that's not represented here, but it has a web-map, you can manually add server data (will be stored locally in your browser's storage).

<h2>Limitations</h2>
Map is shown in an <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe">iframe</a>, which means very limited possible interactions.
Also this is hosted on GitHub Pages, which means no server-side logic.
Many of inconveniences (like not being able to drag the map around and have directions be shown, or having to zoom using a drop-down; not being able to automatically add all the server info with just a map link) stem from these 2 factors. Maybe I'll do something with it when I have more time and energy.

<h2>Who made this</h2>
A player named RaidenFumo, mostly playing on TOPS.

<h3>Contacts</h3>
Discord: @raiden_fumo<br>
E-mail: <a href="mailto:herrscher.of.the.tea@gmail.com">herrscher.of.the.tea@gmail.com</a><br>
GitHub: <a href="https://github.com/herrscher-of-sleeping">https://github.com/herrscher-of-sleeping</a><br>
<br>
You can use either of these contacts for bug reports, suggestions, or to recommend servers to add.

<h2>License information</h2>
This project is licensed under MIT and the source code is <a href="https://github.com/herrscher-of-sleeping/tl-navi">available on GitHub</a>. It uses Vue, Vue-Multiselect, Dexie, i18next and i18next-vue as its direct dependencies. For a full code license information see <a href="dependencies.html">Licenses</a>.
<br>
<br>
<br>
`;

export default {
    "server_editor.webmap_link": "Webmap link (set to get geojson file links and webmap view):",
    "server_editor.server_name": "Server name:",
    "server_editor.translocators_patch": "Translocators list patch:",
    "server_editor.translocators_geojson": "translocators.geojson:",
    "server_editor.landmarks_geojson": "landmarks.geojson:",
    "server_editor.download": "download",
    "server_editor.clear": "Clear",
    "server_editor.delete": "Delete",
    "server_editor.save": "Save",
    "server_editor.cancel": "Cancel",
    "server_editor.configure_servers": "Configure servers",
    "server_editor.patch_help": patchHelp,
    "app.server": "Server:",
    "app.from_coords": "From:",
    "app.to_coords": "To:",
    "app.more_teleporting": "More teleporting",
    "app.more_walking": "more walking.",
    "app.translocator_weight": "Translocator weight ",
    "app.weight_help_zero": "0 means you don't want any extra walking for less teleportations",
    "app.weight_help_nonzero": "This means you're fine walking extra {{weight}} for one less teleportation",
    "app.calculate": "Calculate",

    "path_output.translocator_jumps__one": "{{count}} translocator jump",
    "path_output.translocator_jumps__other": "{{count}} translocator jumps",
    "path_output.approximate_walk_distance": "approximate walk distance:",
    "path_output.blocks__one": "{{count}} block",
    "path_output.blocks__other": "{{count}} blocks",
    "path_output.show_tl_depths": "Show TL depths:",
    "path_output.walk": "Walk",
    "path_output.blocks_from__zero": "blocks from",
    "path_output.blocks_from__one": "block from",
    "path_output.blocks_from__other": "blocks from",
    "path_output.to": "to",
    "path_output.copy_waypoint": "Copy /waypoint command",
    "path_output.map_url_not_set": "Map URL is not set in settings",
    "info_popup.text": infoPopup,
    "info_popup.close": "Close"
}
