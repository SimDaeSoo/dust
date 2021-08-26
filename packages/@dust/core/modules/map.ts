import { MapData, Grid, Tile } from "../interfaces";
import * as seedrandom from 'seedrandom';

function generate(width: number, height: number, seed: string): Grid<Tile> {
  const grid: Grid<Tile> = [];
  const random = seedrandom(seed);

  for (let y = 0; y < height; y++) {
    grid.push(new Array(width));

    for (let x = 0; x < width; x++) {
      if (random() < 0.2) {
        grid[y][x] = { movable: false };
      }
    }
  }

  return grid;
}

function print(map: MapData): void {
  for (let y = 0; y < map.height; y++) {
    const tiles: Array<string> = [];

    for (let x = 0; x < map.width; x++) {
      if (map.grid[y][x] && !map.grid[y][x].movable) {
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