<script setup lang="ts">
import { type CSSProperties, ref, type Ref, watch } from "vue";
import { store } from "@/store";
import { type Point, type RouteSegment, type XZ } from "../pathfinder/types";

const props = defineProps<{
  src: string;
  frameborder?: string;
  style?: CSSProperties;
}>();

const reloadKey = ref(0);

const iframeRef: Ref<HTMLIFrameElement | null> = ref(null);

const realSrc = ref("");

watch(() => props.src, function(newValue: string, oldValue: string = "") {
  const newUrl = newValue ? new URL(newValue) : null;
  const oldUrl = oldValue ? new URL(oldValue) : null;

  if (!oldUrl || newUrl && newUrl.hostname !== oldUrl.hostname) {
    realSrc.value = newValue;
    store.isMapProvidingApi = false;
  } else if (newUrl && store.isMapProvidingApi) {
    iframeRef.value?.contentWindow?.postMessage(
      {
        type: "zoom_pan",
        args: {
          x: newUrl.searchParams.get("x"),
          y: newUrl.searchParams.get("y"),
        }
      },
      newUrl.origin
    );
  } else if (newUrl) {
    realSrc.value = newValue;
  }
}, { immediate: true });


function routeToFeatureList(route: Point[]) {
  const featureList: RouteSegment[] = []
  for (let i = 0; i < route.length - 1; i++) {
    const _start = route[i];
    const _end = route[i + 1];
    const start: XZ = [ _start[0], _start[1] ];
    const start_depth = _start.length == 3? _start[2] : -1;
    const end: XZ = [ _end[0], _end[1] ];
    const end_depth = _end.length == 3? _end[2] : -1;

    const feature: RouteSegment = {
      type: "Feature",
      properties: {
        depth1: start_depth,
        depth2: end_depth,
        label: "",
        tag: "",
        segmentType: i % 2 == 0 ? "walk" : "teleportation",
      },
      geometry: {
        type: "LineString",
        coordinates: [ start, end ],
      },
    }
    featureList.push(feature);
  }
  return {
    type: "FeatureCollection",
    name: "translocators",
    features: featureList,
  };
}

function setRoute(value: Point[]) {
  if (iframeRef.value) {
    iframeRef.value.contentWindow?.postMessage(
      { type: "display_route", args: { route: routeToFeatureList(value) } },
      (new URL(realSrc.value)).origin
    );
  }
}

watch(() => store.route, function(newValue: Point[], oldValue: Point[]) {
  setRoute(newValue);
});

function iframeLoaded() {
  iframeRef.value?.contentWindow?.postMessage(
    {type: "report_api_capabilities"},
    (new URL(realSrc.value)).origin
  );
  if (store.route.length > 0) {
    setRoute(store.route);
  }
}

</script>

<template>
  <iframe ref="iframeRef" v-on:load="iframeLoaded" :src="realSrc" :frameborder="frameborder" :style="style" :key="reloadKey"></iframe>
</template>
