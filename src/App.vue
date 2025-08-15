<script setup lang="ts">
import { type Value } from "./types";
import CoordinateInput from './components/CoordinateInput.vue';
import PathOutput from "./components/PathOutput.vue";
import MapView from "./components/MapView.vue";
import { onMounted, onUnmounted, provide, computed, ref, type Ref } from 'vue';
import * as types from "./pathfinder/types";
import {findPath} from "./pathfinder";
import type { Point, LandmarkFeature} from "./pathfinder/types";
import { subscribe } from "@/signal";


const landmarksList = ref<Value[]>([]);
const translocatorsList = ref<types.TranslocatorsGeojson|null>(null);
const from = ref<Value|null>({coordinates: [0, 0]});
const to = ref<Value|null>({coordinates: [0, 0]});
const isCalculating = ref(false);
const progress = ref(0);
const progressType = ref("");
const path = ref<types.Point[]>([]);
const maxWalkDistance = ref(1000);
const translocatorWeight = ref(300);
const coords: Ref<Point|null> = ref(null);

subscribe("set-display-point", function(point: Point|null) {
  coords.value = point;
});

const leftPaneClass = computed(() => ({
  left: true,
  ["left-fullwidth"]: coords.value === null,
}))

async function calculatePath(from: Value|null, to: Value|null) {
  if (!from || !to) return;
  const fromCoords: Point = [from.coordinates[0], -from.coordinates[1]];
  const toCoords: Point = [to.coordinates[0], -to.coordinates[1]];
  if (isCalculating.value) {
    return;
  }
  if (!translocatorsList.value) {
    return;
  }

  isCalculating.value = true;
  progress.value = 0;

  const pathGenerator = findPath(translocatorsList.value, {
    from: fromCoords,
    to: toCoords,
    queryExpansionStartDist: maxWalkDistance.value,
    translocatorWeight: translocatorWeight.value,
    enableQuadTreeQueryExpansion: true,
  });

  let next;
  while (!(next = await pathGenerator.next()).done) {
    if (typeof next.value === "string") {
      progressType.value = next.value
    } else {
      progress.value = next.value;
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  const result = (await next).value;
  path.value = result;

  isCalculating.value = false;
}

function onButtonClick() {
  calculatePath(from.value, to.value);
}

function handleEnterKey(event: KeyboardEvent) {
  // @ts-expect-error this works, but TODO: track multiselect state or something
  if ((document.querySelectorAll(".multiselect__content-wrapper").entries()).every(item => item[1].style.display === "none")) {
    if (event.key === 'Enter') {
      calculatePath(from.value, to.value);
    }
  }
}

onMounted(async () => {
  landmarksList.value = (await (await fetch("landmarks.geojson")).json()).features.map((feature: LandmarkFeature): Value => {
    const coords =  [feature.geometry.coordinates[0], -feature.geometry.coordinates[1]];
    return {
      name: feature.properties.label,
      coordinates: coords,
    } as Value;
  });
  translocatorsList.value = (await (await fetch("translocators.geojson")).json());
  window.addEventListener('keydown', handleEnterKey);
});

onUnmounted(async () => {
  window.removeEventListener('keydown', handleEnterKey);
})

provide("landmarksList", landmarksList);

</script>

<template>
  <header>
  </header>

  <main>
    <div id="root" class="container">
      <div :class="leftPaneClass">
        <div id="params">
          From:
          <CoordinateInput v-model="from"></CoordinateInput>
          To:
          <CoordinateInput v-model="to"></CoordinateInput>
          <div>
            More teleporting <input type="range" min="0" max="1000" v-model.number="translocatorWeight"> more walking.
            <span>(Translocator weight {{translocatorWeight}})</span>
            <span class="help-tooltip" :title="translocatorWeight === 0? `0 means you don't want any extra walking for less teleportations`:
              `This means you're fine walking extra ${translocatorWeight} for one less teleportation`">?</span>
          </div>
          <button @click="onButtonClick" class="calculate-button">Calculate</button>
          <div v-if="isCalculating" class="progress">
            <p>{{ progressType }}: {{ progress.toFixed(1) }}%</p>
          </div>
        </div>
        <div id="path-output">
          <PathOutput :path="path"></PathOutput>
        </div>
      </div>
      <div class="right">
        <MapView></MapView>
      </div>
    </div>
  </main>
</template>

<style lang="css">
html, body, #root {
  height: 100vh;
  margin: 0;
}
.container {
  display: flex;
  height: 100vh;
}
.left {
  width: 600px;
  display: flex;
  flex-direction: column;
  margin: 10px;
}
.left-fullwidth {
  width: 100%;
}
.right {
  flex: 1;
}

li {
  margin: 5px 0;
  cursor: pointer;
}

.link {
  color: blue;
}

.clicked-link {
  color: violet;
}

input {
  display: inline-block;
  vertical-align: middle;
}
.calculate-button {
  max-width: 300px;
}
.help-tooltip {
  background-color: aqua;
  border-radius: 30px;
  min-width: 1.2em;
  text-align: center;
  display: inline-block;
  margin-left: 2px;
  margin-right: 2px;
  cursor: help;
}
</style>
