import { store } from "@/store";
import { type Point } from "@/pathfinder/types";

export const makeUrl = (coords: null | Point) => {
  if (store.mapLink === "") {
    return "";
  }
  if (coords !== null) {
    return `${store.mapLink}/?x=${coords[0]}&y=${coords[1]}&zoom=${store.zoom}`;
  }
  return "";
};
