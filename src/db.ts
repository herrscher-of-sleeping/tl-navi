import Dexie, { type EntityTable } from "dexie";
import * as types from "./pathfinder/types";
import * as QT from "./pathfinder/quadtree";
import { patchTranslocatorsGeojson } from "./geojsonPatching";

interface Server {
  name: string;
  url?: string;
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
    // server.patchedTranslocatorsGeojson = patchTranslocatorsGeojson(
    //   server.translocatorsGeojson,
    //   server.quadtree,

    // );
  });
});

export type { Server };
export { db };
