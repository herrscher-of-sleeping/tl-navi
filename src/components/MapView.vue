<script setup lang="ts">
import { ref, type Ref } from "vue";
import { type Point } from "@/pathfinder/types";
import { subscribe } from "@/signal";
import { store } from "@/store";

const coords: Ref<null|Point> = ref(null);

const makeUrl = (coords: null|Point) => {
  if (coords !== null) {
    return `${store.mapLink}/?x=${coords[0]}&y=${coords[1]}&zoom=${store.zoom}`;
  }
  return "";
}

function getDisplayStyle(coords: null|Point) {
  return coords === null ? "none" : "";
}

subscribe("set-display-point", function(point: Point|null) {
  coords.value = point;
});

</script>

<template>
  <div v-if="store.mapLink" id="map" :style="{display: getDisplayStyle(coords), height: '100vh', position: 'relative'}">
    <div class="zoom-select-container">
      Zoom: <select v-model="store.zoom">
        <option v-for="zoom in 11" :key="zoom" :value="zoom">{{ zoom }}</option>
      </select>
    </div>
    <iframe :src="makeUrl(coords)" frameborder="0" style="width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0;"></iframe>
  </div>
</template>

<style lang="css" scoped>
@media (prefers-color-scheme: dark) {
  .zoom-select-container {
    background: #222;
    color: white;
  }
}
@media (prefers-color-scheme: light) {
  .zoom-select-container {
    background: white;
    color: black;
  }
}
.zoom-select-container {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10000;
  padding: 5px;
  border-radius: 4px;
}
</style>
