<script setup lang="ts">
import { useAttrs } from "vue";

const attrs = useAttrs();

</script>
<template>
  <div :class="attrs.class">
    <div class="popup-background">
      <div class="popup">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="css">
.popup-background {
  background-color: #FFFFFFAA;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  box-shadow: 5px;
  width: 95%;
}
</style>
