<script setup lang="ts">
import { store } from "../store";
import PopupContainer from "./PopupContainer.vue";
</script>

<template>
  <PopupContainer :class="{ hidden: !store.isShowingInfo }">
    <div class="info-container">

      <h1>TL-Navi</h1>
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
      You use either of these contacts for bug reports, suggestions, or to recommend servers to add.

      <h2>License information</h2>
      This project is licensed under MIT and the source code is <a href="https://github.com/herrscher-of-sleeping/tl-navi">available on GitHub</a>. It uses Vue, Vue-Multiselect and Dexie as its direct dependencies. For a full license information see <a href="dependencies.html">Licenses</a>.
      <br>
      <br>
      <button :onclick="() => store.isShowingInfo = false">Close</button>
    </div>
  </PopupContainer>
</template>

<style lang="css">
.info-container {
  background-color: var(--background-color);
  border: var(--border);
  border-radius: 5px;
  padding: 5px;
  padding: 10px;
}
</style>
