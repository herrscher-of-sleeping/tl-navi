<script setup lang="ts">
import { ref } from "vue";
import { type Point } from "@/pathfinder/types";
import { subscribe, emitSignal } from "@/signal";
import { store } from "@/store";
import { makeUrl } from "@/url";

const isOverlayVisible = ref(true);

function getDisplayStyle(coords: null | Point) {
  return coords === null ? "none" : "";
}

subscribe("set-display-point", function (point: Point | null) {
  store.coords = point;
  isOverlayVisible.value = true;
});

function closeMapView() {
  emitSignal("set-display-point", null);
}
</script>

<template>
  <div
    v-if="store.mapLink"
    id="map"
    :style="{
      display: getDisplayStyle(store.coords),
      height: '100vh',
      position: 'relative',
    }"
  >
    <div class="zoom-select-container">
      <span class="zoom-select-group">
        Zoom:
        <select class="zoom-select" v-model="store.zoom">
          <option v-for="zoom in 11" :key="zoom" :value="zoom">{{ zoom }}</option>
        </select>
      </span>
      <button class="close-button" @click="closeMapView">Close map view</button>
    </div>

    <iframe
      :src="makeUrl(store.coords)"
      frameborder="0"
      style="
        width: 100%;
        height: 100%;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
      "
    ></iframe>
    <div
      class="overlay"
      :class="{ 'overlay-hidden': !isOverlayVisible }"
      @click="isOverlayVisible = false"
    >
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
  background-color: white;
}
</style>
