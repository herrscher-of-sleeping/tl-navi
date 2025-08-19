<script setup lang="ts">
import { ref, type Ref } from "vue";
import { type Point } from "@/pathfinder/types";
import { subscribe } from "@/signal";
import { store } from "@/store";

const coords: Ref<null|Point> = ref(null);

const makeUrl = (coords: null|Point) => {
  if (coords !== null) {
    return `${store.mapLink}/?x=${coords[0]}&y=${coords[1]}&zoom=11`;
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
  <div v-if="store.mapLink" id="map" :style="{display: getDisplayStyle(coords), height: '100vh'}">
    <iframe :src="makeUrl(coords)" frameborder="0" style="width: 100%; height: 100vh; display: block;"></iframe>
  </div>
</template>
