<script setup lang="ts">
import { store } from "../store";
import PopupContainer from "./PopupContainer.vue";
</script>

<template>
  <PopupContainer :class="{ hidden: !store.isShowingInfo }">
    <div class="info-container">

      <div class="scrollable-area" v-html="$t('info_popup.text')"></div>
      <button :onclick="() => store.isShowingInfo = false">{{ $t("info_popup.close") }}</button>
    </div>
  </PopupContainer>
</template>

<style lang="css">
.info-container {
  background-color: var(--background-color);
  border: var(--border);
  border-radius: 5px;
  padding: 10px;
}

.scrollable-area {
  max-height: 90vh;
  overflow-wrap: break-word;
  overflow-y: auto;
}
</style>
