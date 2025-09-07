import { reactive, watch } from "vue";
import { db } from "./db";
import * as types from "./pathfinder/types";
import { makeUrl } from "@/url";

export const TOPS_NAME = "TOPS (default)";
export const TOPS_MAP_URL = "https://map.tops.vintagestory.at";

const getServerList = async () => {
  return (await db.servers.toArray()).map(server => server.name);
};

export const store = reactive({
  serverList: [] as string[],
  currentServer: "",
  translocatorsGeojson: null as types.TranslocatorsGeojson | null,
  landmarksGeojson: null as types.LandmarksGeojson | null,
  mapLink: "",
  isEditingServer: false,
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

export function setServerValueOrDefault(currentServer: undefined | string = undefined) {
  const localStorageCurrentServer =
    currentServer || localStorage.getItem("currentServer") || TOPS_NAME;
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

db.servers.toArray().then(async value => {
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

  setServerValueOrDefault();
});
