import { AABB, type QuadTree } from "./pathfinder/quadtree";
import * as types from "./pathfinder/types";


// This smells awful
export function patchTranslocatorsGeojson(
  originalGeojson: types.TranslocatorsGeojson,
  quadTree: QuadTree,
  patch: types.TranslocatorsPatch
): types.TranslocatorsGeojson {
  const geojson = structuredClone(originalGeojson);
  const addOperations: types.TranslocatorPatchOperationAdd[] = [];
  const deleteOperations = [];
  const idsToRemove: number[] = [];
  // TODO: Handle correctly when deleting points added in the patch itself.

  for (let i = 0; i < patch.length; i++) {
    const change = patch[i];
    switch (change.operation) {
      case "add":
        addOperations.push(change);
        break;
      case "delete":
        const queryResult = quadTree.queryRange(new AABB([change.from.x - 3, change.from.z - 3], 6));
        if (queryResult.length > 0) {
          // Find the closest translocator to this point
          let minDist2 = Infinity;
          let minDistIdx = null;
          for (let i = 0; i < queryResult.length; i++) {
            // TODO: Do we only have 2D points here? If not, should either fix the logic here, or prepare the data better
            const dx = change.from.x - queryResult[i][0][0];
            const dz = change.from.z - queryResult[i][0][1];
            const dist2 = dx * dx + dz * dz;
            if (dist2 < minDist2) {
              minDist2 = dist2;
              minDistIdx = i;
            }
          }
          if (minDistIdx !== null) {
            const resultId = queryResult[minDistIdx][1];
            idsToRemove.push(resultId);
          }
        }

        deleteOperations.push(change);
        break;

    }
  }

  const pairIdsToRemove = new Set<number>();
  for (const id of idsToRemove) {
    const pairId = Math.floor(id / 2);
    pairIdsToRemove.add(pairId);
  }
  const fullIdList = [...pairIdsToRemove];
  fullIdList.sort((a, b) => a < b ? 1 : (a == b ? 0 : -1));
  const features = geojson.features;
  for (const id of fullIdList) {
    features.splice(id, 1);
  }
  geojson.features = features;
  for (const change of addOperations) {
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
    })
  }

  return geojson;
}
