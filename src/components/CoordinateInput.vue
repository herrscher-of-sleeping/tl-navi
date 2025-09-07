<script setup lang="ts">
import { Multiselect } from "vue-multiselect";
import { type Value } from "../types";
import { watch, ref, computed, type Ref, nextTick } from "vue";
import { store } from "../store";
import * as types from "../pathfinder/types";

const props = defineProps({
  modelValue: {
    type: Object as () => Value | null,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref<Value[]>([]);
const multiselectRef: Ref<null | typeof Multiselect> = ref(null);
const searchText = ref("");
const taggable = ref(false);
const isOpen = ref(false);

watch(
  () => store.landmarksGeojson,
  newLandmarks => {
    if (!newLandmarks) {
      options.value = [];
      return;
    }
    options.value = newLandmarks.features.map((feature: types.LandmarkFeature): Value => {
      const coords = [feature.geometry.coordinates[0], -feature.geometry.coordinates[1]];
      return {
        name: feature.properties.label,
        coordinates: coords,
      } as Value;
    });
  },
  { immediate: true }
);

const value = computed({
  get: () => props.modelValue,
  set: (newValue: Value) => {
    emit("update:modelValue", newValue);
  },
});

const formatLocation = ({ name, coordinates }: Value) => {
  if (!name) {
    return `[${coordinates[0]},${coordinates[1]}]`;
  }
  return `${name} — [${coordinates[0]},${coordinates[1]}]`;
};

const parseCoordinates = (str: string): [number, number] | null => {
  const coordsRegexp = /^(-?)(\d+)\s*[, ]\s*(-?)(\d+)$/;
  const match = str.match(coordsRegexp);
  if (!match) {
    return null;
  }
  let x = Number(match[2]);
  if (match[1] === "-") {
    x *= -1;
  }
  let z = Number(match[4]);
  if (match[3] === "-") {
    z *= -1;
  }
  return [x, z];
};

const searchChange = (s: string) => {
  const coordinates = parseCoordinates(s);
  if (coordinates) {
    taggable.value = true;
    searchText.value = s;
    value.value = { name: s, coordinates: coordinates };
  } else {
    taggable.value = false;
  }
};

const addTag = (newTag: string) => {
  const coordinates = parseCoordinates(newTag);
  if (!coordinates) {
    return;
  }
  if (value.value && value.value.coordinates) {
    const currentCoordinates = value.value.coordinates;
    if (currentCoordinates[0] === coordinates[0] && currentCoordinates[1] === coordinates[1]) {
      return;
    }
  }
  const tag = {
    name: coordinates?.join(", "),
    coordinates: coordinates,
  } as Value;
  value.value = tag;
  searchText.value = `${coordinates[0]}, ${coordinates[1]}`;
};

const open = () => {
  isOpen.value = true;
  nextTick(() => {
    if (multiselectRef.value) {
      // multiselectRef.value.search = searchText.value;
      const coordinates = value.value?.coordinates;
      if (coordinates) {
        multiselectRef.value.search = `${coordinates[0]}, ${coordinates[1]}`;
      }
    }
  });
};

const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <multiselect
    ref="multiselectRef"
    v-model="value"
    :option-height="32"
    :options="options"
    :disabled="store.isEditingServer"
    :custom-label="formatLocation"
    :searchable="true"
    :preserveSearch="true"
    :taggable="taggable"
    :clearOnSelect="false"
    @tag="addTag"
    @open="open"
    @close="close"
    @search-change="searchChange"
    tag-placeholder=""
    placeholder="Find landmark or enter coordinates"
    label="name"
    track-by="name"
    aria-label="pick a value"
  >
  </multiselect>
</template>
