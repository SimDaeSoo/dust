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
          stableLevel: 0,
          movable: false,
          stable: false,
          checked: false,
        };
      } else {
        grid[y][x] = {
          diff: 0,
          liquid: options.initLiquid ? (Math.random() < 0.05 ? 3 : 0) : 0,
          stableLevel: 0,
          movable: true,
          stable: false,
          checked: false,
        };
      }
    }
  }

  return grid;
}

function getDefaultUnstablePoints(map: MapData): Array<Point> {
  const unstablePoints: Array<Point> = [];

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.grid[y][x].liquid) unstablePoints.push({ x, y });
    }
  }

  return unstablePoints;
}

function print(map: MapData, options?: { checkPoints: Array<{ position: Point, color: string, marker: string }> }): void {
  const tileStrings: Array<Array<string>> = [];

  for (let y = 0; y < map.height; y++) {
    tileStrings.push([]);

    for (let x = 0; x < map.width; x++) {
      if (!map.grid[y][x].movable) {
        tileStrings[y].push('■');
      } else if (map.grid[y][x].liquid > 0.5 || (y > 0 && map.grid[y - 1][x].liquid > 0)) {
        if (map.grid[y][x].stable) {
          tileStrings[y].push('\x1b[31m■\x1b[0m');
        } else {
          tileStrings[y].push('\x1b[34m■\x1b[0m');
        }
      } else if (map.grid[y][x].liquid > 0) {
        if (map.grid[y][x].stable) {
          tileStrings[y].push('\x1b[31m_\x1b[0m');
        } else {
          tileStrings[y].push('\x1b[34m_\x1b[0m');
        }
      } else {
        tileStrings[y].push(' ');
      }
    }
  }

  const checkPoints = options?.checkPoints || [];
  for (let checkPoint of checkPoints) {
    if (map.grid[Math.floor(checkPoint.position.y / map.tileSize)][Math.floor(checkPoint.position.x / map.tileSize)].movable && !map.grid[Math.floor(checkPoint.position.y / map.tileSize)][Math.floor(checkPoint.position.x / map.tileSize)].liquid) {
      tileStrings[Math.floor(checkPoint.position.y / map.tileSize)][Math.floor(checkPoint.position.x / map.tileSize)] = `${checkPoint.color}${checkPoint.marker}\x1b[0m`;
    } else {
      tileStrings[Math.floor(checkPoint.position.y / map.tileSize)][Math.floor(checkPoint.position.x / map.tileSize)] = `\x1b[32m■\x1b[0m`;
    }
  }

  for (let y = 0; y < map.height; y++) {
    console.log(tileStrings[y].toString().replace(/,/g, ' '));
  }
}

export {
  generate,
  getDefaultUnstablePoints,
  print
}