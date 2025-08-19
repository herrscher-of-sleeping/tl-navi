import { reactive, watch } from "vue";
import { db } from "./db";
import * as Signal from "./signal";
import * as types from "./pathfinder/types"

export const TOPS_NAME = "TOPS (default)";
export const TOPS_MAP_URL = "https://map.tops.vintagestory.at";

const getServerList = async () => {
  return (await db.servers.toArray()).map(server => server.name);
}

export const store = reactive({
  serverList: [] as string[],
  currentServer: "",
  translocatorsGeojson: null as types.TranslocatorsGeojson|null,
  landmarksGeojson: null as types.LandmarksGeojson|null,
  mapLink: "",
  isEditingServer: false,
});

const formatURL = (userUrlInput?: string): string => {
  if (!userUrlInput) {
    return "";
  }
  let urlWithProtocol = userUrlInput;
  if (!userUrlInput.startsWith("https://") && !userUrlInput.startsWith("http://")) {
    urlWithProtocol = "https://" + userUrlInput
  }
  try {
    const url = new URL(urlWithProtocol);
    return url.origin;
  } catch (e) {
    console.log(e);
    return "";
  }
}

const updateServerInfo = async (serverName: string) => {
  localStorage.setItem("currentServer", serverName);
  const serverInfo = (await db.servers.where("name").equals(serverName).first())
  store.translocatorsGeojson = serverInfo?.translocatorsGeojson as types.TranslocatorsGeojson;
  store.landmarksGeojson = serverInfo?.landmarksGeojson as types.LandmarksGeojson;
  store.mapLink = formatURL(serverInfo?.url);
}

watch(() => store.currentServer, updateServerInfo)

Signal.subscribe("serverListUpdated", async function(args : { currentServer?: string } = {}) {
  const localStorageCurrentServer = args.currentServer || localStorage.getItem("currentServer")

  store.serverList = await getServerList();

  if (localStorageCurrentServer && store.serverList.indexOf(localStorageCurrentServer) !== -1) {
    store.currentServer = localStorageCurrentServer;
  } else if (!localStorageCurrentServer || store.serverList.indexOf(localStorageCurrentServer) === -1) {
    store.currentServer = store.serverList[0];
  }
  updateServerInfo(store.currentServer);
})

db.servers.toArray().then(async (value) => {
  try {
    const [translocatorsResponse, landmarksResponse] = await Promise.all([
      fetch("translocators.geojson"),
      fetch("landmarks.geojson"),
    ]);

    const [translocatorsGeojson, landmarksGeojson] = await Promise.all([
      translocatorsResponse.json(),
      landmarksResponse.json(),
    ]);

    await db.servers.put({
      name: TOPS_NAME,
      url: TOPS_MAP_URL,
      translocatorsGeojson,
      landmarksGeojson,
    });
  } catch (error) {
    console.error("Error fetching or storing geojson files:", error);
  }
  Signal.emitSignal("serverListUpdated");
});
