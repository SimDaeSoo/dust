import { MapData, Square, Vector, CollisionDirectionLine, DIRECTION, Point } from "../interfaces";
import { collision } from "../modules/Engine";
import { getLightingPolygon } from "../modules/Lighting";
import { print, generate } from "../modules/Map";

function main(): void {
  const seed: string = `${Math.random()}`;
  const width: number = 100;
  const height: number = 30;
  const tileSize: number = 4;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed, 0.1)
  };
  const position: Point = { x: 198, y: 58 };
  getLightingPolygon(position, map, 10);
  console.log(seed);
}

main();