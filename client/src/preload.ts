import { Grid, Map, MapData, Tile } from "@dust/core";
import { contextBridge } from "electron";

let mapData: MapData;
contextBridge.exposeInMainWorld(
  "electron", {
  getMap: (): MapData => mapData,
  createMap: (): void => {
    mapData = Map.generate({
      seed: `${Math.random()}`,
      width: 100,
      height: 100,
      tileSize: 32,
      step: 4,
      clearTop: 0,
      tileTypes: [4],
      density: {
        block: 0.3,
        liquid: 0
      },
      birthLimit: 3,
      deathLimit: 2,
      liquidLimit: 0
    });
    console.log(mapData);
  }
}
);