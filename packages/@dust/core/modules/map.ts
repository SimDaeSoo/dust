import { MapData, Grid, Tile, Point } from "../interfaces";
import * as seedrandom from 'seedrandom';

// TODO: Garbage Collection 최적화.
function generate(
  options: {
    width: number,
    height: number,
    tileSize: number,
    seed: string,
    step: number,
    clearTop: number,
    tileTypes: Array<number>,
    density: {
      block: number,
      liquid: number
    },
    deathLimit: number,
    birthLimit: number,
    liquidLimit: number
  }): MapData {
  const { width, height, tileSize, seed, step, density, deathLimit, birthLimit, clearTop, liquidLimit } = options;
  const baseGrid: Grid<boolean> = createEmptyBoolGrid(width, height);
  const random = seedrandom(seed);
  const unstables: Array<{ points: Array<Point>, length: number }> = [
    { points: new Array(liquidLimit).fill(true).map(() => ({ x: 0, y: 0 })), length: 0 },
    { points: new Array(liquidLimit).fill(true).map(() => ({ x: 0, y: 0 })), length: 0 }
  ];

  fillRandomGrid(baseGrid, seed, density.block);

  for (let i = 0; i < step; i++) {
    nextStep(baseGrid, { deathLimit, birthLimit })
  }

  const grid: Grid<Tile> = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width));

    for (let x = 0; x < width; x++) {
      if (y >= clearTop && baseGrid[y][x]) {
        grid[y][x] = {
          diff: 0,
          liquid: 0,
          stableLevel: 0,
          movable: false,
          stable: false,
          checked: false,
          lightLevel: 0,
          backgroundTileType: 1,
          backgroundTileNumber: 0,
          tileNumber: 0,
          tileType: options.tileTypes[Math.floor(Math.random() * options.tileTypes.length)]
        };
      } else {
        grid[y][x] = {
          diff: 0,
          liquid: random() < density.liquid ? 1 : 0,
          stableLevel: 0,
          movable: true,
          stable: false,
          checked: false,
          lightLevel: 0,
          backgroundTileType: 1,
          backgroundTileNumber: 0,
          tileNumber: 0,
          tileType: 0
        };
      }

      if (grid[y][x].liquid) {
        unstables[0].points[unstables[0].length].x = x;
        unstables[0].points[unstables[0].length++].y = y;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y][x].tileNumber = getTileNumber(grid, x, y);
    }
  }

  return {
    seed,
    width,
    height,
    tileSize,
    grid,
    unstables,
    liquidLimit
  };
}

function getTileNumber(grid: Grid<Tile>, x: number, y: number): number {
  const topLeft = y > 0 && x > 0 && grid[y - 1][x - 1].tileType === grid[y][x].tileType;
  const top = y > 0 && grid[y - 1][x].tileType === grid[y][x].tileType;
  const topRight = y > 0 && x < grid[0].length - 1 && grid[y - 1][x + 1].tileType === grid[y][x].tileType;
  const left = x > 0 && grid[y][x - 1].tileType === grid[y][x].tileType;
  const right = x < grid[0].length - 1 && grid[y][x + 1].tileType === grid[y][x].tileType;
  const bottomLeft = y < grid.length - 1 && x > 0 && grid[y + 1][x - 1].tileType === grid[y][x].tileType;
  const bottom = y < grid.length - 1 && grid[y + 1][x].tileType === grid[y][x].tileType;
  const bottomRight = y < grid.length - 1 && x < grid[0].length - 1 && grid[y + 1][x + 1].tileType === grid[y][x + 1].tileType;

  if (!top && !left && right && bottom) return 1;
  if (!top && left && right && bottom && !bottomLeft && bottomRight) return 41;
  if (!top && left && right && bottom && !bottomLeft && !bottomRight) return 42;
  if (!top && left && right && bottom && bottomLeft && !bottomRight) return 43;
  if (!top && left && right && bottom) return 2; // || 25
  if (!top && left && !right && bottom) return 3;
  if (top && left && right && bottom && topLeft && topRight && bottomLeft && !bottomRight) return 4;
  if (top && left && right && !bottom && !topLeft && topRight) return 51;
  if (top && left && right && !bottom && topLeft && !topRight) return 53;
  if (top && left && right && !bottom && !topLeft && !topRight) return 52;
  if (top && left && right && !bottom) return 5; // || 22
  if (top && left && right && bottom && topLeft && topRight && !bottomLeft && bottomRight) return 6;
  if (top && left && right && bottom && topLeft && topRight && bottomLeft && bottomRight) return 12; // || 12 || 20
  if (top && !left && right && bottom && !topRight && bottomRight) return 36;
  if (top && !left && right && bottom && !topRight && !bottomRight) return 37;
  if (top && !left && right && bottom && topRight && !bottomRight) return 38;
  if (top && !left && right && bottom) return 11;
  if (top && left && !right && bottom && topLeft && !bottomLeft) return 44;
  if (top && left && !right && bottom && !topLeft && !bottomLeft) return 45;
  if (top && left && !right && bottom && !topLeft && bottomLeft) return 46;
  if (top && left && !right && bottom) return 13;
  if (top && left && right && bottom && !topLeft && topRight && !bottomLeft && bottomRight) return 17;
  if (top && left && right && bottom && topLeft && topRight && !bottomLeft && !bottomRight) return 18;
  if (top && left && right && bottom && !topLeft && topRight && bottomLeft && !bottomRight) return 19;
  if (top && !left && right && !bottom) return 21;
  if (top && left && !right && !bottom) return 23;
  if (top && left && right && bottom && topLeft && !topRight && bottomLeft && bottomRight) return 24;
  if (top && left && right && bottom && !topLeft && topRight && bottomLeft && bottomRight) return 57;
  if (top && left && right && bottom && topLeft && !topRight && bottomLeft && !bottomRight) return 27;
  if (top && left && right && bottom && !topLeft && !topRight && bottomLeft && bottomRight) return 28;
  if (top && left && right && bottom && topLeft && !topRight && !bottomLeft && bottomRight) return 29;
  if (!top && !left && right && !bottom) return 32;
  if (!top && left && right && !bottom) return 33;
  if (!top && left && !right && !bottom) return 34;
  if (top && left && right && bottom && !topLeft && !topRight && !bottomLeft && !bottomRight) return 35;
  if (!top && !left && !right && bottom) return 54;
  if (top && !left && !right && bottom) return 55;
  if (top && !left && !right && !bottom) return 56;

  if (top && left && right && bottom && topLeft && !topRight && !bottomLeft && !bottomRight) return 35;
  if (top && left && right && bottom && !topLeft && topRight && !bottomLeft && !bottomRight) return 35;
  if (top && left && right && bottom && !topLeft && !topRight && bottomLeft && !bottomRight) return 35;
  if (top && left && right && bottom && !topLeft && !topRight && !bottomLeft && bottomRight) return 35;

  return 31;
}

// https://gamedevelopment.tutsplus.com/tutorials/generate-random-cave-levels-using-cellular-automata--gamedev-9664
function countAliveNeighbours(grid: Grid<boolean>, x: number, y: number): number {
  let count = 0;

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let neighborX: number = x + i;
      let neighborY: number = y + j;
      if (i == 0 && j == 0) {
      }
      else if (neighborX < 0 || neighborY < 0 || neighborX >= grid[0].length || neighborY >= grid.length) {
        count = count + 1;
      }
      else if (grid[neighborY][neighborX]) {
        count = count + 1;
      }
    }
  }

  return count;
}

function createEmptyBoolGrid(width: number, height: number): Grid<boolean> {
  let grid: Grid<boolean> = [];

  for (let i = 0; i < height; i++) {
    grid.push(new Array(width).fill(false));
  }

  return grid;
}

function fillRandomGrid(grid: Grid<boolean>, seed: string, density: number): void {
  const random = seedrandom(seed);

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      grid[y][x] = random() < density;
    }
  }
}

function nextStep(grid: Grid<boolean>, options: { deathLimit: number, birthLimit: number }): void {
  const afterGrid: Grid<boolean> = createEmptyBoolGrid(grid[0].length, grid.length);
  const { deathLimit, birthLimit } = options;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      let alives: number = countAliveNeighbours(grid, x, y);

      if (grid[y][x]) {
        if (alives < deathLimit) {
          afterGrid[y][x] = false;
        }
        else {
          afterGrid[y][x] = true;
        }
      }
      else {
        if (alives > birthLimit) {
          afterGrid[y][x] = true;
        }
        else {
          afterGrid[y][x] = false;
        }
      }
    }
  }

  for (let y = 0; y < afterGrid.length; y++) {
    for (let x = 0; x < afterGrid[0].length; x++) {
      grid[y][x] = afterGrid[y][x]
    }
  }
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
  createEmptyBoolGrid,
  getTileNumber,
  fillRandomGrid,
  nextStep,
  print
}