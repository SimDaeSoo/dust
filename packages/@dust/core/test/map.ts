import { MapData, Grid, Tile } from "../interfaces";
import { print, createEmptyBoolGrid, fillRandomGrid, nextStep } from "../modules/Map";
import * as seedrandom from 'seedrandom';

async function mapGenrateTest(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    const seed = `${Math.random()}`;
    const width = 50;
    const height = 35;
    const step = 3;
    const density = {
      block: 0.3,
      liquid: 0
    };
    const birthLimit = 3;
    const deathLimit = 2;
    const clearTop = 10;
    const baseGrid: Grid<boolean> = createEmptyBoolGrid(width, height);
    const random = seedrandom(seed);

    fillRandomGrid(baseGrid, seed, density.block);

    console.clear();
    printBooleanGrid(baseGrid, width, height);
    console.log('step:', 0);
    console.log('seed:', seed);
    console.log('width:', width);
    console.log('height:', height);
    console.log('density:', density);
    console.log('deathLimit:', deathLimit);
    console.log('birthLimit:', birthLimit);
    console.log('clearTop:', clearTop);
    await sleep(500);

    for (let i = 0; i < step; i++) {
      nextStep(baseGrid, { deathLimit, birthLimit });
      console.clear();
      printBooleanGrid(baseGrid, width, height);
      console.log('step:', i + 1);
      console.log('seed:', seed);
      console.log('width:', width);
      console.log('height:', height);
      console.log('density:', density);
      console.log('deathLimit:', deathLimit);
      console.log('birthLimit:', birthLimit);
      console.log('clearTop:', clearTop);
      await sleep(500);
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
            tileType: 1,
            tileNumber: 0,
            backgroundTileType: 0,
            backgroundTileNumber: 0,
            lightLevel: 0
          };
        } else {
          grid[y][x] = {
            diff: 0,
            liquid: random() < density.liquid ? 1 : 0,
            stableLevel: 0,
            movable: true,
            stable: false,
            checked: false,
            tileType: 0,
            tileNumber: 0,
            backgroundTileType: 0,
            backgroundTileNumber: 0,
            lightLevel: 0
          };
        }
      }
    }
    const map: MapData = { seed, width, height, tileSize: 4, grid, unstables: [{ points: [], length: 0 }, { points: [], length: 0 }], liquidLimit: 3000000 };
    console.clear();
    print(map);
    console.log('step:', step);
    console.log('seed:', seed);
    console.log('width:', width);
    console.log('height:', height);
    console.log('density:', density);
    console.log('deathLimit:', deathLimit);
    console.log('birthLimit:', birthLimit);
    console.log('clearTop:', clearTop);
    await sleep(500);
  }

  console.log('Map Generating Test Done...');
  console.log('After 2 seconds the next test starts');
  await sleep(2000);
}

function printBooleanGrid(grid: Grid<boolean>, width: number, height: number): void {
  const tileStrings: Array<Array<string>> = [];

  for (let y = 0; y < height; y++) {
    tileStrings.push([]);
    for (let x = 0; x < width; x++) {
      if (grid[y][x]) {
        tileStrings[y].push('■');
      } else {
        tileStrings[y].push(' ');
      }
    }
  }

  for (let y = 0; y < height; y++) {
    console.log(tileStrings[y].toString().replace(/,/g, ' '));
  }
}

function sleep(dt: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, dt);
  })
}

export {
  mapGenrateTest
}