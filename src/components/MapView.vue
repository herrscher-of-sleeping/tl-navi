<script setup lang="ts">
import { ref, type Ref } from "vue";
import { type Point } from "@/pathfinder/types";
import { subscribe } from "@/signal";
import { store } from "@/store";
import { makeUrl } from "@/url";

const coords: Ref<null|Point> = ref(null);

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
