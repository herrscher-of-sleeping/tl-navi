<script setup lang="ts">
import { type Point } from "../pathfinder/types";
import { ref, type Ref, h, computed } from "vue";
import CopyIcon from "./icons/IconCopy.vue";
import TranslocatorIcon from "./icons/IconTranslocator.vue";
import { emitSignal } from "@/signal";

const props = defineProps<{
  path: Point[]
}>();

const activeElement: Ref<null|number> = ref(null);
const activePoint: Ref<null|Point> = ref(null);
const copyInput = ref();

function isSamePoint(a: Point|null, b: Point|null) {
  if (a === null || b === null) { return false; }
  return a[0] === b[0] && a[1] === b[1];
}

function navigateToPoint(i: number|null) {
  if (i === null) {
    emitSignal("set-display-point", null)
  } else {
    emitSignal("set-display-point", props.path[i])
  }
}

function copyCommand(point0: Point, point1: Point) {
  const cmd = `/waypoint addati spiral ${point0[0]} 110 ${-point0[1]} false purple TL to ${point1[0]}, ${-point1[1]}`;

  if (!copyInput.value) {
    return;
  }

  copyInput.value.value = cmd;
  copyInput.value.select();
  copyInput.value.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyInput.value.value);
}

const CoordClickie = (localProps: {pointId: number}) => {
  const pointId = Number(localProps["pointId"]);
  const point = props.path[pointId];
  const onClick = () => {
    const id = Number(pointId)
    if (id === activeElement.value) {
      activeElement.value = null;
      activePoint.value = null;
      navigateToPoint(null);
    } else {
      activeElement.value = id;
      activePoint.value = point;
      navigateToPoint(id);
    }
  }
  const openInANewTab = () => {
    const point = props.path[pointId];
    const url =  `https://map.tops.vintagestory.at/?x=${point[0]}&y=${point[1]}&zoom=11`;
    window.open(url, "_blank");
  }
  let copyButton = null;
  if (pointId > 0 && pointId !== props.path.length - 1) {
    copyButton = h(
      "a",
      {
        onClick: () => {
          const otherPointId = pointId % 2 ? pointId + 1 : pointId - 1;
          copyCommand(props.path[pointId], props.path[otherPointId]);
        },
        title: "Copy waypoint command"
      },
      [h(CopyIcon)]
    );
  }
  const tlIcon = pointId === 0 || pointId === props.path.length - 1 ? null : h(TranslocatorIcon);
  return h(
    "span",
    {},
    [
      h(
        "button",
        {
          onClick: onClick,
          onMousedown: (event: MouseEvent) => {
            if (event.button === 1) {
              openInANewTab();
            }
          },
          class: {
            "coord-clickie": true,
            "coord-clickie-active": isSamePoint(activePoint.value, point)
          },
        },
        [
        tlIcon,
          `[${props.path[Number(localProps["pointId"])][0]}, ${-props.path[Number(localProps["pointId"])][1]}]`,
        ]
      ),
      copyButton
    ]
  )
}

CoordClickie.props = [ "pointId" ];

function getDistance(a: Point, b: Point) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

const distances = computed(() => {
  const result = [];
  for (let i = 0; i < props.path.length / 2; i++) {
    result.push(Math.round(getDistance(props.path[i * 2], props.path[i * 2 + 1])));
  }
  return result;
})

const totalDistance = computed(() => {
  return distances.value.reduce((sum, distance) => sum + distance, 0);
})

const getClassByTravelDistance = (distance: number) => {
  if (distance < 100) {
    return "travel-distance-short";
  } else if (distance < 500) {
    return "travel-distance-medium";
  } else if (distance < 1000) {
    return "travel-distance-long";
  } else if (distance < 2000) {
    return "travel-distance-very-long";
  }
  return "travel-distance-insane";
}

</script>

<template>
  <input style="display:none" ref="copyInput">
  <div class="list" v-if="path.length > 0">
    <div>
      {{ props.path.length / 2 - 1 }} translocator jumps; approximate walk distance: {{ totalDistance }} blocks
      <ul id="path">
        <li v-for="(distance, index) in distances" :key="index">
          Walk <span :class="getClassByTravelDistance(distance)">{{ distance }}</span> blocks
          from <coord-clickie :point-id="index * 2"></coord-clickie>
          to <coord-clickie :point-id="index * 2 + 1"></coord-clickie>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
li {
  margin: 5px 0;
  cursor: pointer;
}

.link {
  color: blue;
}

.clicked-link {
  color: violet;
}

.center {
  text-align: center;
}

.list {
  flex: 1;
  overflow-y: auto;
}
</style>
