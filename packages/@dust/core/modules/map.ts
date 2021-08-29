import { MapData, Grid, Tile, Point } from "../interfaces";
import * as seedrandom from 'seedrandom';

function generate(width: number, height: number, seed: string, density: number): Grid<Tile> {
  const grid: Grid<Tile> = [];
  const random = seedrandom(seed);

  for (let y = 0; y < height; y++) {
    grid.push(new Array(width));

    for (let x = 0; x < width; x++) {
      if (random() < density) {
        grid[y][x] = { movable: false };
      }
    }
  }

  return grid;
}

function print(map: MapData, options?: { checkPoints: Array<Point> }): void {
  for (let y = 0; y < map.height; y++) {
    const tiles: Array<string> = [];

    for (let x = 0; x < map.width; x++) {
      const filteredcheckPoints = options?.checkPoints.filter(({ x: x1, y: y1 }: Point) => Math.floor(x1 / map.tileSize) === x && Math.floor(y1 / map.tileSize) === y);
      if (filteredcheckPoints?.length) {
        tiles.push('\x1b[31m◈\x1b[0m');
      } else if (map.grid[y][x] && !map.grid[y][x].movable) {
        tiles.push('■');
      } else {
        tiles.push('□');
      }
    }
    console.log(tiles.toString().replace(/,/g, ' '));
  }
}

export {
  generate,
  print
}