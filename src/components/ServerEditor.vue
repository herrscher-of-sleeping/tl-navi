<script setup lang="ts">
import { Multiselect } from "vue-multiselect";
import { ref, type Ref } from "vue";
import { store, TOPS_NAME } from "../store";
import { db } from "../db";
import * as Signal from "../signal";
import * as types from "../pathfinder/types";

let translocatorsGeojson: undefined|types.TranslocatorsGeojson;
let landmarksGeojson: undefined|types.LandmarksGeojson;
const serverName: Ref<string> = ref("");
const serverLink: Ref<string> = ref("");
const translocatorsInput: Ref<HTMLInputElement|null> = ref(null);
const landmarksInput: Ref<HTMLInputElement|null> = ref(null);

const onTranslocatorsFileChange = () => {
  const reader = new FileReader();
  const target = translocatorsInput.value as HTMLInputElement;
  reader.onload = function() {
    const stringValue = reader.result as string;
    try {
      const jsonValue = JSON.parse(stringValue)
      if (jsonValue.type === "FeatureCollection" && jsonValue.name === "translocators") {
        translocatorsGeojson = jsonValue;
        return;
      }
    } catch (e) {
      console.log(e);
    }
    alert("Please select a corrent translocators.geojson file");
    target.value = "";
  }
  if (target.files && target.files[0]) {
    reader.readAsText(target.files[0]);
  }
}

const onLandmarksFileChange = () => {
  const reader = new FileReader();
  const target = landmarksInput.value as HTMLInputElement;
  reader.onload = function() {
    const stringValue = reader.result as string;
    try {
      const jsonValue = JSON.parse(stringValue)
      if (jsonValue.type === "FeatureCollection" && jsonValue.name === "landmarks") {
        landmarksGeojson = jsonValue;
        return;
      }
    } catch (e) {
      console.log(e);
    }
    alert("Please select a corrent landmarks.geojson file");
    target.value = "";
  }
  if (target.files && target.files[0]) {
    reader.readAsText(target.files[0]);
  }
}

const saveData = () => {
  if (serverName.value === TOPS_NAME) {
    alert("Cannot overwrite default server data!");
    return;
  }
  db.servers.put({
    name: serverName.value,
    url: serverLink.value,
    translocatorsGeojson: translocatorsGeojson,
    landmarksGeojson: landmarksGeojson,
  });
  Signal.emitSignal("serverListUpdated", { currentServer: serverName.value });
  Signal.emitSignal("updateServerInfo", serverName.value);
  store.isEditingServer = false;
}

const clearFields = () => {
  serverName.value = "";
  serverLink.value = "";
  translocatorsInput.value!.value = "";
  landmarksInput.value!.value = "";
}

const deleteCurrent = () => {
  if (serverName.value === TOPS_NAME) {
    alert("Cannot delete default server data!");
    return
  }
  db.servers.where("name").equals(serverName.value).delete();
  Signal.emitSignal("serverListUpdated");
  store.isEditingServer = false;
  store.currentServer = TOPS_NAME;
}

const cancel = () => {
  clearFields();
  store.isEditingServer = false;
}

const startEditing = () => {
  store.isEditingServer = true;
  serverName.value = store.currentServer;
  serverLink.value = store.mapLink;
  const translocatorsInputTransfer = new DataTransfer();
  translocatorsInputTransfer.items.add(new File([JSON.stringify(store.translocatorsGeojson)], 'translocators.geojson', { type: "application/json"}));
  translocatorsInput.value!.files = translocatorsInputTransfer.files;
  onTranslocatorsFileChange();

  if (store.landmarksGeojson) {
    const landmarksInputTransfer = new DataTransfer();
    landmarksInputTransfer.items.add(new File([JSON.stringify(store.landmarksGeojson)], 'landmarks.geojson', { type: "application/json"}));
    landmarksInput.value!.files = landmarksInputTransfer.files;
    onLandmarksFileChange();
  }
}

</script>

<template>
  <div>
    <multiselect
      class="server-select"
      v-model="store.currentServer"
      :disabled="store.isEditingServer"
      :options="store.serverList"
      :searchable="false"
      :allow-empty="false"
    ></multiselect> <button @click="startEditing">Configure</button> <button :class="{ hidden: !store.isEditingServer }" @click="saveData">Save</button> <button :class="{ hidden: !store.isEditingServer }" @click="cancel">Cancel</button>
    <div class="server-editor" :class="{ hidden: !store.isEditingServer }">
      <div><button @click="clearFields">Clear</button> <button @click="deleteCurrent">Delete</button></div>
      <div>Server name:</div>
      <div><input v-model="serverName" type="text"></div>
      <div>Webmap link (set to get geojson file links and webmap view):</div>
      <div><input v-model="serverLink" type="text"></div>
      <div>translocators.geojson: <a v-if="serverLink" :href="serverLink + '/data/geojson/translocators.geojson'">download</a></div>
      <div><input ref="translocatorsInput" accept=".json, .geojson" id="translocators_file" type="file" @change="onTranslocatorsFileChange"></div>
      <div>landmarks.geojson: <a v-if="serverLink" :href="serverLink + '/data/geojson/landmarks.geojson'">download</a></div>
      <div><input ref="landmarksInput" accept=".json, .geojson" id="landmarks_file" type="file" @change="onLandmarksFileChange"></div>
    </div>
  </div>
</template>

<style lang="css" scoped>
input, button {
  margin-bottom: 5px;
}
@media (prefers-color-scheme: dark) {
  input {
    background-color: transparent;
    color: white;
    border-radius: 5px;
  }

  .server-editor {
    border-color: white;
  }
}

.server-editor {
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  border-color: #e8e8e8;
  padding: 5px;
}

input[type=text] {
  width: calc(100% - 10px);
  min-height: 32px;
  border-color: #e8e8e8;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
}

.hidden {
  display: none;
}

.server-select {
  display: inline-block;
  max-width: 400px;
}
</style>
