<script setup lang="ts">
import { type Value } from "./types";
import CoordinateInput from "./components/CoordinateInput.vue";
import PathOutput from "./components/PathOutput.vue";
import MapView from "./components/MapView.vue";
import { onMounted, onUnmounted, computed, ref } from "vue";
import * as types from "./pathfinder/types";
import { findPath } from "./pathfinder";
import ServerEditor from "./components/ServerEditor.vue";
import { store } from "./store";

type Point = types.Point;

function _isMobile() {
  return window.innerWidth < 1500 || window.innerWidth < window.innerHeight;
}

const from = ref<Value | null>({ coordinates: [0, 0] });
const to = ref<Value | null>({ coordinates: [0, 0] });
const isCalculating = ref(false);
const progress = ref(0);
const progressType = ref("");
const path = ref<types.Point[]>([]);
const maxWalkDistance = ref(1000);
const translocatorWeight = ref(300);
const isMobile = ref(_isMobile());

const leftPaneClass = computed(() => ({
  left: true,
  ["left-fullwidth"]: store.coords === null,
}));

async function calculatePath(from: Value | null, to: Value | null) {
  if (!from || !to) return;
  const fromCoords: Point = [from.coordinates[0], -from.coordinates[1]];
  const toCoords: Point = [to.coordinates[0], -to.coordinates[1]];
  if (isCalculating.value) {
    return;
  }
  if (!store.translocatorsGeojson) {
    return;
  }

  isCalculating.value = true;
  progress.value = 0;

  const pathGenerator = findPath(store.translocatorsGeojson, {
    from: fromCoords,
    to: toCoords,
    queryExpansionStartDist: maxWalkDistance.value,
    translocatorWeight: translocatorWeight.value,
    enableQuadTreeQueryExpansion: true,
  });

  let next;
  while (!(next = await pathGenerator.next()).done) {
    if (typeof next.value === "string") {
      progressType.value = next.value;
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
  if (store.isEditingServer) {
    return;
  }
  // @ts-expect-error this works, but TODO: track multiselect state or something
  if (
    document
      .querySelectorAll(".multiselect__content-wrapper")
      .entries()
      .every(item => item[1].style.display === "none")
  ) {
    if (event.key === "Enter") {
      calculatePath(from.value, to.value);
    }
  }
}

const handleResize = () => {
  isMobile.value = _isMobile();
};

onMounted(async () => {
  window.addEventListener("keydown", handleEnterKey);
  window.addEventListener("resize", handleResize);
});

onUnmounted(async () => {
  window.removeEventListener("keydown", handleEnterKey);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <header></header>

  <main>
    <div id="root" class="container">
      <div :class="leftPaneClass">
        <div id="params">
          <div class="editor-line">
            Select server:
            <ServerEditor></ServerEditor>
          </div>
          <div class="editor-line">
            From:
            <CoordinateInput v-model="from"></CoordinateInput>
          </div>
          <div class="editor-line">
            To:
            <CoordinateInput v-model="to"></CoordinateInput>
          </div>
          <div class="editor-line">
            More teleporting
            <input
              :disabled="store.isEditingServer"
              type="range"
              min="0"
              max="1000"
              v-model.number="translocatorWeight"
            />
            more walking.
            <span>(Translocator weight {{ translocatorWeight }})</span>
            <span
              class="help-tooltip"
              :title="
                translocatorWeight === 0
                  ? `0 means you don't want any extra walking for less teleportations`
                  : `This means you're fine walking extra ${translocatorWeight} for one less teleportation`
              "
              onclick="alert(this.title)"
              >?</span
            >
          </div>
          <button :disabled="store.isEditingServer" @click="onButtonClick" class="calculate-button">
            Calculate
          </button>
          <div v-if="isCalculating" class="progress">
            <p>{{ progressType }}: {{ progress.toFixed(1) }}%</p>
          </div>
        </div>
        <div id="path-output">
          <PathOutput :path="path"></PathOutput>
        </div>
      </div>
      <div
        :class="{ right: !isMobile, 'map-popup': isMobile }"
        :style="{ display: store.coords === null ? 'none' : 'block' }"
      >
        <MapView></MapView>
      </div>
    </div>
  </main>
</template>

<style lang="css">
html,
body,
#root {
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

#path-output {
  height: 100vh;
  overflow-y: auto;
  margin-top: 10px;
}

.left-fullwidth {
  width: 100%;
}
.right {
  flex: 1;
}
.map-popup {
  position: fixed;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  z-index: 1000;
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
.editor-line {
  padding-bottom: 5px;
}
</style>
