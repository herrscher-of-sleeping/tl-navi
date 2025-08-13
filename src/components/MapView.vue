<script setup lang="ts">
import { type Point } from "../pathfinder/types";
import { ref, type Ref } from "vue";
import { subscribe } from "@/signal";

const coords: Ref<null|Point> = ref(null);

const makeUrl = (coords: null|Point) => {
  if (coords !== null) {
    return `https://map.tops.vintagestory.at/?x=${coords[0]}&y=${coords[1]}&zoom=11`;
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
  <div id="map" :style="{display: getDisplayStyle(coords), height: '100vh'}">
    <!-- <div style="min-width: 400px;min-height: 400px;"></div> -->
    <iframe :src="makeUrl(coords)" frameborder="0" style="width: 100%; height: 100vh; display: block;"></iframe>
  </div>
</template>
