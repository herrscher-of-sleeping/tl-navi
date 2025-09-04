<script setup lang="ts">
import { ref } from "vue";

const src = ref("");
const reloadKey = ref(0);
const frameborder = ref("");
const style = ref("");

</script>

<template>
  <iframe :src="src" :frameborder="frameborder" :style="style" :key="reloadKey"></iframe>
</template>
