<script setup lang="ts">
import { Multiselect } from "vue-multiselect";
import { store } from "../store";
import SettingsIcon from "@/components/icons/IconSettings.vue";
import { ref, type Ref } from "vue";
import { db } from "../db";
import * as types from "../pathfinder/types";

const multiselectRef: Ref<null | typeof Multiselect> = ref(null);


async function openServerEditor(option: string, event: Event) {
  if (multiselectRef.value) {
    multiselectRef.value.deactivate();
    const serverInfo = await db.servers.where("name").equals(option).first();
    if (!serverInfo) {
      event.stopPropagation();
      return;
    }

    store.serverEditorServerName = option;
    store.serverEditorServerURL = serverInfo.url as string || "";
    store.serverEditorTranslocatorsGeojson = serverInfo.translocatorsGeojson as types.TranslocatorsGeojson;
    store.serverEditorLandmarksGeojson = serverInfo.landmarksGeojson as types.LandmarksGeojson;
    store.serverEditorTranslocatorsPatch = serverInfo.translocatorsPatch as string || "";

    store.isEditingServer = true;
  }
  event.stopPropagation();
}

</script>

<template>
  <div :style="{display: 'inherit'}">
    <multiselect
      ref="multiselectRef"
      :class="{'server-select': true, tlNaviSelect: true}"
      v-model="store.currentServer"
      :disabled="store.isEditingServer"
      :options="store.serverList"
      :searchable="false"
      :allow-empty="false"
      :showLabels="false"
      group-values="servers"
      group-label="group"
    >
      <template #option="{ option }">
        <div v-if="option.$isLabel">
          {{ option.$groupLabel }}
        </div>
        <div v-else class="configure-server-option-container">
          <span>{{ option }}</span>
          <button class="configure-server-option-button" @click="(event) => openServerEditor(option, event)">
            <SettingsIcon></SettingsIcon>
          </button>
        </div>
      </template>
    </multiselect>
  </div>
</template>

<style lang="css" scoped>
input,
button {
  margin-bottom: 5px;
}

.server-editor {
  padding: 5px;
}

input[type="text"] {
  width: calc(100% - 10px);
  min-height: 32px;
}

.hidden {
  display: none;
}

.server-select {
  display: inline-block;
  max-width: 400px;
}

:deep(.multiselect__content-wrapper) {
  width: 300px;
  min-width: 100%;
}

.configure-server-option-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.configure-server-option-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  line-height: 1;
  margin-top: -12px;
  margin-bottom: -12px;
  background-color: var(--background-color);
}

.configure-server-option-button svg {
  display: block;
  width: 24px;
  height: 24px;
}
</style>
