<script setup lang="ts">
import { type Point } from "@/pathfinder/types";
import { store, setDisplayPoint } from "@/store";
import { makeUrl } from "@/url";
import IconArrowOut from "./icons/IconArrowOut.vue";
import IconArrowIn from "./icons/IconArrowIn.vue";
import MapFrame from "./MapFrame.vue";
import { watch, ref } from "vue";

function getDisplayStyle(coords: null | Point) {
  return coords === null ? "none" : "";
}

const reloadKey = ref(0);


watch(
  () => store.showMapOverlay,
  (value: boolean) => {
    if (value && store.coords) {
      reloadKey.value++;
    }
  }
);

watch(
  () => store.zoom,
  () => {
    store.url = makeUrl(store.coords);
  }
)

function closeMapView() {
  setDisplayPoint(null);
}

const zoomCoef = [
  1 / 256,
  1 / 128,
  1 / 64,
  1 / 32,
  1 / 16,
  1 / 8,
  1 / 4,
  1 / 2,
  1,
  2,
  4,
  8
];

function getOtherPointScreenOffset(): string {
  if (store.otherCoords === null || store.coords === null) {
    return "";
  }
  if (store.zoom < 5) {
    return "";
  }
  const zoom: number | undefined = zoomCoef[store.zoom];
  if (!zoom) {
    return "";
  }
  const offset = [store.otherCoords[0] - store.coords[0], store.otherCoords[1] - store.coords[1]];
  const scaledOffset = [offset[0] * zoom, -offset[1] * zoom];
  return `translate(${scaledOffset[0]}px,${scaledOffset[1]}px)`;
}

</script>

<template>
  <div v-if="store.mapLink" id="map" :style="{
    display: getDisplayStyle(store.coords),
    height: '100vh',
    position: 'relative',
  }">
    <div class="zoom-select-container">
      <span class="zoom-select-group">
        Zoom:
        <select class="zoom-select" v-model="store.zoom">
          <option v-for="zoom in 11" :key="zoom" :value="zoom">{{ zoom }}</option>
        </select>
      </span>
      <span class="map-overlay-checkbox">Overlay<input type="checkbox" v-model="store.showMapOverlay"></span>
      <button class="close-button" @click="closeMapView">Close map view</button>
    </div>

    <MapFrame :src="store.url" frameborder="0" :key="reloadKey"
      style="
        width: 100%;
        height: 100%;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
      "></MapFrame>
    <div class="overlay" :class="{ 'overlay-hidden': !store.showMapOverlay }" @click="store.showMapOverlay = false">
      <div class="map-target">
        <div class="map-target map-target-inside-dot"></div>
      </div>
      <icon-arrow-out v-if="store.angleOut !== null" class="map-target-arrow"
        :style="{ transform: `translate(-50%, -50%) rotate(${store.angleOut}rad)` }"></icon-arrow-out>
      <icon-arrow-in v-if="store.angleIn !== null" class="map-target-arrow"
        :style="{ transform: `translate(-50%, -50%) rotate(${store.angleIn}rad)` }"></icon-arrow-in>
      <div class="map-target map-target-other" :style="{
        transform: `translate(-50%, -50%) ${getOtherPointScreenOffset()} !important`,
      }">
        <div class="map-target map-target-inside-dot"></div>
      </div>
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

.map-target-arrow {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
