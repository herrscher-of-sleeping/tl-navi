<script setup lang="ts">
import QuestionIcon from "./icons/IconQuestion.vue";

const props = defineProps<{
  text: string;
}>();

</script>

<template>
<span class="help-button"
  :title="props.text"
  onclick="alert(this.title)"
><QuestionIcon></QuestionIcon></span>
</template>

<style scoped lang="css">
.help-button svg {
  height: 18px;
  vertical-align: text-bottom;
}

.help-button {
  cursor: help;
}
</style>
