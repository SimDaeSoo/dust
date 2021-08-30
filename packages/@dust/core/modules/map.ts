import { MapData, Grid, Tile, Point } from "../interfaces";
import * as seedrandom from 'seedrandom';

function generate(width: number, height: number, seed: string, options: { density: number, initLiquid: boolean } = { density: 0.3, initLiquid: false }): Grid<Tile> {
  const grid: Grid<Tile> = [];
  const random = seedrandom(seed);

  for (let y = 0; y < height; y++) {
    grid.push(new Array(width));

    for (let x = 0; x < width; x++) {
      if (random() < options.density) {
        grid[y][x] = {
          diff: 0,
          liquid: 0,
          settled: false,
          settleCount: 0,
          movable: false
        };
      } else {
        grid[y][x] = {
          diff: 0,
          liquid: options.initLiquid ? (Math.random() < 0.1 ? 3 : 0) : 0,
          settled: false,
          settleCount: 0,
          movable: true
        };
      }
    }
  }

  return grid;
}

function print(map: MapData, options?: { checkPoints: Array<{ position: Point, color: string, marker: string }> }): void {
  const tileStrings: Array<Array<string>> = [];

  for (let y = 0; y < map.height; y++) {
    tileStrings.push([]);

    for (let x = 0; x < map.width; x++) {
      if (!map.grid[y][x].movable) {
        tileStrings[y].push('■');
      } else if (map.grid[y][x].liquid !== 0) {
        tileStrings[y].push('\x1b[34m●\x1b[0m');
      } else {
        tileStrings[y].push(' ');
      }
    }
  }

  const checkPoints = options?.checkPoints || [];
  for (let checkPoint of checkPoints) {
    tileStrings[Math.floor(checkPoint.position.y / map.tileSize)][Math.floor(checkPoint.position.x / map.tileSize)] = `${checkPoint.color}${checkPoint.marker}\x1b[0m`;
  }

  for (let y = 0; y < map.height; y++) {
    console.log(tileStrings[y].toString().replace(/,/g, ' '));
  }
}

export {
  generate,
  print
}