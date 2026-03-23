import { reactive, watch } from "vue";
import { db } from "./db";
import * as types from "./pathfinder/types";
import { makeUrl } from "@/url";

export const TOPS_NAME = "TOPS (default)";
export const TOPS_MAP_URL = "https://map.tops.vintagestory.at";

export const DEFAULT_SERVERS: { [key: string]: { [key: string]: string}} = {
  [TOPS_NAME]: {
    url: "https://map.tops.vintagestory.at",
    translocators: "tops_translocators.geojson",
    landmarks: "tops_landmarks.geojson",

  },
  "Old TOPS (default)": {
    url: "https://map.oldtops.vintagestory.at",
    translocators: "old_tops_translocators.geojson",
    landmarks: "old_tops_landmarks.geojson",
  },
  "Aurafury Riverlands (default)": {
    url: "https://map.ri.aurafury.org",
    translocators: "aurafury_riverlands_translocators.geojson",
    landmarks: "aurafury_riverlands_landmarks.geojson",
  },
  "Aurafury Crystal Seas (default)": {
    url: "https://map.cs.aurafury.org",
    translocators: "aurafury_crystal_seas_translocators.geojson",
    landmarks: "aurafury_crystal_seas_landmarks.geojson",
  }
};

export const getServerList = async () => {
  return (await db.servers.toArray()).map(server => server.name);
};

export const store = reactive({
  serverList: await getServerList() as string[],
  currentServer: "",
  translocatorsGeojson: null as types.TranslocatorsGeojson | null,
  landmarksGeojson: null as types.LandmarksGeojson | null,
  mapLink: "",
  isEditingServer: false,
  isShowingInfo: false,
  zoom: 5,
  coords: null as null | types.Point,
  otherCoords: null as null | types.Point,
  angleIn: null as null | number,
  angleOut: null as null | number,
  showMapOverlay: false,
  url: "",
});

export const formatURL = (userUrlInput?: string): string => {
  if (!userUrlInput) {
    return "";
  }
  let urlWithProtocol = userUrlInput;
  if (!userUrlInput.startsWith("https://") && !userUrlInput.startsWith("http://")) {
    urlWithProtocol = "https://" + userUrlInput;
  }
  try {
    const url = new URL(urlWithProtocol);
    return url.origin;
  } catch (e) {
    console.log(e);
    return "";
  }
};

watch(() => store.currentServer, updateServerInfo);

watch(
  () => store.currentServer,
  async (newValue: string) => {
    updateServerInfo(newValue);
  }
);

export async function updateServerList() {
  store.serverList = await getServerList() as string[];
};

watch(
  () => store.isEditingServer,
  async (newValue, oldValue) => {
    if (!newValue) {
      updateServerList();
    }
  }
);

export async function setServerValueOrDefault(currentServer: undefined | string = undefined) {
  let localStorageCurrentServer =
    currentServer || localStorage.getItem("currentServer") || TOPS_NAME;
  const servers_count = await db.servers.where("name").equals(localStorageCurrentServer).count();
  if (servers_count < 1) {
    localStorageCurrentServer = TOPS_NAME;
  }
  store.currentServer = localStorageCurrentServer;
}

export async function updateServerInfo(serverName: string) {
  localStorage.setItem("currentServer", serverName);
  const serverInfo = await db.servers.where("name").equals(serverName).first();
  store.translocatorsGeojson = serverInfo?.translocatorsGeojson as types.TranslocatorsGeojson;
  store.landmarksGeojson = serverInfo?.landmarksGeojson as types.LandmarksGeojson;
  store.mapLink = formatURL(serverInfo?.url);
}

export function setDisplayPoint(point: types.Point | null) {
  store.coords = point;
  store.showMapOverlay = true;
  store.url = makeUrl(store.coords);
}

db.servers.toArray().then(async () => {
  const fetchPromises = Object.entries(DEFAULT_SERVERS).map(async ([server_name, server_info]) => {
    const translocatorsUrl = `data/geojson/${server_info.translocators}`;
    const landmarksUrl = `data/geojson/${server_info.landmarks}`;

    try {
      const [translocatorsResponse, landmarksResponse] = await Promise.all([
        fetch(translocatorsUrl),
        fetch(landmarksUrl),
      ]);

      const [translocatorsGeojson, landmarksGeojson] = await Promise.all([
        translocatorsResponse.json(),
        landmarksResponse.json(),
      ]);

      await db.servers.put({
        name: server_name,
        url: server_info.url,
        translocatorsGeojson,
        landmarksGeojson,
      });
    } catch (error) {
      console.error(`Error fetching or storing geojson files for ${server_name}:`, error);
    }
  });

  await Promise.all(fetchPromises);
  await updateServerList()
  await setServerValueOrDefault();
});
