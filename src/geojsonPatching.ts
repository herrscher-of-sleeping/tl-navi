import * as types from "./pathfinder/types";


export function patchTranslocatorsGeojson(originalGeojson: types.TranslocatorsGeojson, patch: types.TranslocatorsPatch): types.TranslocatorsGeojson {
  const geojson = structuredClone(originalGeojson);
  for (let i = 0; i < patch.length; i++) {
    const change = patch[i];
    if (change.operation === "add") {
      geojson.features.push({
        type: "Feature",
        properties: {
          depth1: change.from.y ?? 0,
          depth2: change.to.y ?? 0,
          label: "",
          tag: ""
        },
        geometry: {
          type: "LineString",
          coordinates: [ [change.from.x, change.from.z], [ change.to.x, change.to.z ] ],
        }
      });
    }
  }
  return geojson;
}
