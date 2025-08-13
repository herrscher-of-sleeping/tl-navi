<script lang="ts">
import { Multiselect } from 'vue-multiselect'
import { type Value } from "../types";
import { defineComponent, inject, watch, ref, computed, type Ref, nextTick } from 'vue';

export default defineComponent({
  components: {
    Multiselect
  },
  props: {
    modelValue: {
      type: Object as () => Value|null,
      required: true
    }
  },
  setup(props, { emit }) {
    const landmarksList = inject("landmarksList") as Ref<Value[]>;
    const options = ref<Value[]>([]);
    const multiselectRef: Ref<null|Multiselect> = ref(null);
    const searchText = ref("");
    const taggable = ref(false);
    const isOpen = ref(false);

    // Watch for changes in landmarksList and update options
    watch(
      landmarksList,
      (newLandmarks) => {
        options.value = newLandmarks; // Update options
      },
      { immediate: true }
    );

    const value = computed({
      get: () => props.modelValue,
      set: (newValue: Value) => {
        emit("update:modelValue", newValue);
      }
    });

    const formatLocation = ({ name, coordinates }: Value) => {
      if (!name) {
        return coordinates;
      }
      return `${name} — [${coordinates}]`;
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
            // @ts-expect-error property `search` exists, trust me
            multiselectRef.value.search = `${coordinates[0]}, ${coordinates[1]}`;
          }
        }
      });
    }

    const close = () => {
      isOpen.value = false;
    }

    return {
      value,
      options,
      multiselectRef,
      formatLocation,
      searchChange,
      addTag,
      open,
      close,
      taggable,
    };
  }
});
</script>

<template>
  <multiselect ref="multiselectRef" id="single-select-search" v-model="value"
  :options="options"
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
    aria-label="pick a value">
  </multiselect>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
