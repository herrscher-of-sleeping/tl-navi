<script setup lang="ts">
import { ref, type Ref } from "vue";
import { type Point } from "@/pathfinder/types";
import { subscribe } from "@/signal";
import { store } from "@/store";
import { makeUrl } from "@/url";

const coords: Ref<null|Point> = ref(null);
const isOverlayVisible = ref(true);

function getDisplayStyle(coords: null|Point) {
  return coords === null ? "none" : "";
}

subscribe("set-display-point", function(point: Point|null) {
  coords.value = point;
  isOverlayVisible.value = true;
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
    <div class="overlay" :class="{'overlay-hidden': !isOverlayVisible }" @click="isOverlayVisible=false">
      <div class="map-target"></div>
      <div class="map-target map-target-inside-dot"></div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.overlay-hidden {
  display: none;
}

.map-target {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: purple;
  padding: 5px;
  border-radius: 5px;
  text-align: center;
}

.map-target-inside-dot {
  padding: 2px;
  border-radius: 2px;
  background-color: white
}
</style>
