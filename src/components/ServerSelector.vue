<script setup lang="ts">
import { Multiselect } from "vue-multiselect";
import { store } from "../store";
import SettingsIcon from "./icons/IconSettings.vue";

const startEditing = () => {
  store.isEditingServer = true;
};

</script>

<template>
  <div :style="{display: 'inherit'}">
    <multiselect
      :class="{'server-select': true, tlNaviSelect: true}"
      v-model="store.currentServer"
      :disabled="store.isEditingServer"
      :options="store.serverList"
      :searchable="false"
      :allow-empty="false"
      :showLabels="false"
    ></multiselect>
    <button :class="{ tlNaviButton: true, tlNaviIconButton: true }" @click="startEditing" title="Configure servers"><SettingsIcon></SettingsIcon></button>
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
</style>
