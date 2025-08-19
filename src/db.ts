import Dexie, { type EntityTable } from 'dexie';
import * as Signal from "./signal";

interface Server {
  name: string,
  url?: string,
  translocatorsGeojson?: Object,
  landmarksGeojson?: Object,
}

const db = new Dexie('ServersDatabase') as Dexie & {
  servers: EntityTable<Server, "name">;
};
db.version(1).stores({
  servers: 'name, url, translocatorsGeojson, landmarksGeojson',
});

export type { Server };
export { db };
