import Dexie, { type EntityTable } from "dexie";
import * as types from "./pathfinder/types";
import * as QT from "./pathfinder/quadtree";
import { patchTranslocatorsGeojson } from "./geojsonPatching";

interface Server {
  name: string;
  url?: string;
  isDefault?: boolean;
  translocatorsGeojson?: types.TranslocatorsGeojson;
  landmarksGeojson?: types.LandmarksGeojson;
  quadtree: QT.QuadTree;
  translocatorsPatch?: string;
  patchedTranslocatorsGeojson?: types.TranslocatorsGeojson|null;
  patchedQuadtree?: QT.QuadTree|null;
}

const db = new Dexie("ServersDatabase") as Dexie & {
  servers: EntityTable<Server, "name">;
};

db.version(1).stores({
  servers: "name, url, translocatorsGeojson, landmarksGeojson",
});

db.version(2).stores({
  servers: "name, url, translocatorsGeojson, landmarksGeojson, quadtree, translocatorsPatch, patchedTranslocatorsGeojson, patchedQuadtree",
}).upgrade(trans => {
  return trans.table("servers").toCollection().modify(server => {
    server.quadtree = QT.QuadTree.fromTranslocatorsGeojson(server.translocatorsGeojson);
  });
});

const oldDefaultServerNames = new Set([
  "TOPS (default)",
  "Old TOPS (default)",
  "Aurafury Riverlands (default)",
  "Aurafury Crystal Seas (default)",
  "Eclipse (default)",
]);

db.version(3).stores({
  servers: "name, isDefault, url, translocatorsGeojson, landmarksGeojson, quadtree, translocatorsPatch, patchedTranslocatorsGeojson, patchedQuadtree",
}).upgrade(async trans => {
  await trans.table("servers").where("name").anyOf([...oldDefaultServerNames]).delete();
});


export type { Server };
export { db };
