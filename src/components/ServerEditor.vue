<script setup lang="ts">
import { ref, type Ref, watch } from "vue";
import { store, TOPS_NAME, DEFAULT_SERVERS, formatURL, setServerValueOrDefault, updateServerInfo } from "../store";
import { db } from "../db";
import * as types from "../pathfinder/types";
import PopupContainer from "./PopupContainer.vue";
import * as QT from "../pathfinder/quadtree";
import { patchTranslocatorsGeojson } from "@/geojsonPatching";
import HelpButton from "./HelpButton.vue";

let translocatorsGeojson: undefined | types.TranslocatorsGeojson;
let landmarksGeojson: undefined | types.LandmarksGeojson;
const serverName: Ref<string> = ref("");
const serverLink: Ref<string> = ref("");
const translocatorsPatch: Ref<string> = ref("");
const translocatorsInput: Ref<HTMLInputElement | null> = ref(null);
const landmarksInput: Ref<HTMLInputElement | null> = ref(null);

const startEditing = () => {
  console.log(store.currentServer, store.mapLink);
  serverName.value = store.currentServer;
  serverLink.value = store.mapLink;
  translocatorsPatch.value = store.translocatorsPatch;

  const translocatorsInputTransfer = new DataTransfer();
  translocatorsInputTransfer.items.add(
    new File([JSON.stringify(store.translocatorsGeojson)], "translocators.geojson", {
      type: "application/json",
    })
  );
  translocatorsInput.value!.files = translocatorsInputTransfer.files;
  onTranslocatorsFileChange();

  if (store.landmarksGeojson) {
    const landmarksInputTransfer = new DataTransfer();
    landmarksInputTransfer.items.add(
      new File([JSON.stringify(store.landmarksGeojson)], "landmarks.geojson", {
        type: "application/json",
      })
    );
    landmarksInput.value!.files = landmarksInputTransfer.files;
    onLandmarksFileChange();
  }
};


watch(
  () => store.isEditingServer,
  (newValue, oldValue) => {
    console.log(oldValue, newValue);
    if (newValue == true) {
      startEditing()
    }
  }
)


const onTranslocatorsFileChange = () => {
  const reader = new FileReader();
  const target = translocatorsInput.value as HTMLInputElement;
  reader.onload = function () {
    const stringValue = reader.result as string;
    try {
      const jsonValue = JSON.parse(stringValue);
      if (jsonValue.type === "FeatureCollection" && jsonValue.name === "translocators") {
        translocatorsGeojson = jsonValue;
        return;
      }
    } catch (e) {
      console.log(e);
    }
    alert("Please select a corrent translocators.geojson file");
    target.value = "";
  };
  if (target.files && target.files[0]) {
    reader.readAsText(target.files[0]);
  }
};

const onLandmarksFileChange = () => {
  const reader = new FileReader();
  const target = landmarksInput.value as HTMLInputElement;
  reader.onload = function () {
    const stringValue = reader.result as string;
    try {
      const jsonValue = JSON.parse(stringValue);
      if (jsonValue.type === "FeatureCollection" && jsonValue.name === "landmarks") {
        landmarksGeojson = jsonValue;
        return;
      }
    } catch (e) {
      console.log(e);
    }
    alert("Please select a corrent landmarks.geojson file");
    target.value = "";
  };
  if (target.files && target.files[0]) {
    reader.readAsText(target.files[0]);
  }
};

const vector2Re = /^(-?\d+)\s*(?:,|\s+)\s*(-?\d+)$/;
const vector3Re = /^(-?\d+)\s*(?:,|\s+)\s*(-?\d+)\s*(?:,|\s+)\s*(-?\d+)$/;
const commandRe = /^(add|delete)\s*(.*)/;

function parseNumber(text: string): types.Point3D|undefined {
  const parsedParts = vector2Re.exec(text) ?? vector3Re.exec(text);
  if (!parsedParts) {
    return;
  }
  if (parsedParts.length == 3) {
    return { x: Number(parsedParts[1]), y: 0, z: -Number(parsedParts[2]) };
  }
  if (parsedParts.length == 4) {
    return { x: Number(parsedParts[1]), y: Number(parsedParts[2]), z: -Number(parsedParts[3]) };
  }
}

function parseTranslocatorsPatch(text: string): types.TranslocatorsPatch {
  const result: types.TranslocatorsPatch = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const matchResult = commandRe.exec(line);
    if (!matchResult) {
      continue;
    }
    const [command, args] = [ matchResult[1], matchResult[2] ];

    if (command === "add") {
      const parts = args.split(" to ");
      if (parts.length !== 2) {
        continue;
      }
      const fromPoint = parseNumber(parts[0]);
      const toPoint = parseNumber(parts[1]);
      if (fromPoint && toPoint) {
        result.push({ operation: "add", from: fromPoint, to: toPoint });
      }
    } else if (command === "delete") {
      const point = parseNumber(args);
      if (point) {
        result.push({ operation: "delete", from: point });
      }
    }
  }
  return result;
}

const saveData = async () => {
  if (DEFAULT_SERVERS[serverName.value]) {
    alert("Cannot overwrite default server data!");
    return;
  }
  const quadTree = QT.QuadTree.fromTranslocatorsGeojson(translocatorsGeojson!!);
  let patchedTranslocatorsGeojson: types.TranslocatorsGeojson|undefined|null = null;
  let patchedQuadtree: QT.QuadTree|null = null;
  if (translocatorsPatch.value.trim().length > 0) {
    const parsedPatch = parseTranslocatorsPatch(translocatorsPatch.value);
    patchedTranslocatorsGeojson = patchTranslocatorsGeojson(
      translocatorsGeojson!!,
      quadTree,
      parsedPatch
    );
    patchedQuadtree = QT.QuadTree.fromTranslocatorsGeojson(patchedTranslocatorsGeojson);
  }
  db.servers.put({
    name: serverName.value,
    url: serverLink.value,
    translocatorsGeojson: translocatorsGeojson,
    landmarksGeojson: landmarksGeojson,
    translocatorsPatch: translocatorsPatch.value,
    patchedTranslocatorsGeojson: patchedTranslocatorsGeojson,
    quadtree: quadTree,
    patchedQuadtree: patchedQuadtree,
  });
  await setServerValueOrDefault(serverName.value);
  await updateServerInfo(serverName.value);
  store.isEditingServer = false;
};

const clearFields = () => {
  serverName.value = "";
  serverLink.value = "";
  translocatorsInput.value!.value = "";
  landmarksInput.value!.value = "";
};

const deleteCurrent = async () => {
  if (DEFAULT_SERVERS[serverName.value]) {
    alert("Cannot delete default server data!");
    return;
  }
  db.servers.where("name").equals(serverName.value).delete();
  await setServerValueOrDefault();
  store.isEditingServer = false;
  store.currentServer = TOPS_NAME;
};

const cancel = () => {
  clearFields();
  store.isEditingServer = false;
};


</script>

<template>
  <PopupContainer :class="{ hidden: !store.isEditingServer }">
    <div>
      <div class="server-editor" :style="{ marginTop: '5px' }">
        <div>{{ $t("server_editor.server_name") }}</div>
        <div><input v-model="serverName" type="text" /></div>
        <div>{{ $t("server_editor.webmap_link") }}</div>
        <div><input v-model="serverLink" type="text" /></div>
        <div>
          {{ $t("server_editor.translocators_geojson") }}
          <a v-if="serverLink" :href="formatURL(serverLink) + '/data/geojson/translocators.geojson'"
            >{{ $t("server_editor.download") }}</a
          >
        </div>
        <div>
          <input
            ref="translocatorsInput"
            accept=".json, .geojson"
            id="translocators_file"
            type="file"
            @change="onTranslocatorsFileChange"
          />
        </div>
        <div>
          {{ $t("server_editor.landmarks_geojson") }}
          <a v-if="serverLink" :href="formatURL(serverLink) + '/data/geojson/landmarks.geojson'"
            >{{ $t("server_editor.download") }}</a
          >
        </div>
        <div>
          <input
            ref="landmarksInput"
            accept=".json, .geojson"
            id="landmarks_file"
            type="file"
            @change="onLandmarksFileChange"
          />
        </div>
        <div class="patch-panel">
          <div>
            {{ $t("server_editor.translocators_patch") }}
            <HelpButton :text="$t('server_editor.patch_help')"></HelpButton>
          </div>
          <textarea v-model="translocatorsPatch" :style="{ minHeight: '100px', resize: 'none' }"></textarea>
        </div>
        <div>
          <button :class="{ tlNaviButton: true }" @click="clearFields">{{ $t("server_editor.clear") }}</button>
          <button :class="{ tlNaviButton: true }" @click="deleteCurrent">{{ $t("server_editor.delete") }}</button>
          <button :class="{ tlNaviButton: true }" @click="saveData">{{ $t("server_editor.save") }}</button>
          <button :class="{ tlNaviButton: true }" @click="cancel">{{ $t("server_editor.cancel") }}</button>
        </div>
      </div>
    </div>
  </PopupContainer>
</template>

<style lang="css" scoped>
input,
button {
  margin-bottom: 5px;
}

.server-editor {
  background-color: var(--background-color);
  padding: 5px;
}

textarea,
input[type="text"] {
  width: calc(100% - 10px);
  min-height: 32px;
}

.server-select {
  display: inline-block;
  max-width: 400px;
}

.tlNaviButton {
  margin-right: 5px;
}
.patch-panel {
  margin-bottom: 5px;
}
</style>
