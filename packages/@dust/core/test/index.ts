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
    grid: generate(width, height, seed, 0.4)
  };
  const position: Point = { x: 198, y: 58 };
  const tiles = getLightingPolygon(position, map, 10, { getTiles: true });
  print(map, { checkPoints: [position] });
  console.log(new Array(width).fill('-').toString().replace(/,/g, '-'));
  print(map, { checkPoints: tiles.map(({ x, y }) => ({ x: x * tileSize, y: y * tileSize })) });
  console.log(seed);
}

main();