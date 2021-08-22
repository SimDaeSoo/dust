import { Grid } from "../interfaces";
// import * as seedrandom from 'seedrandom';

function generate(width: number, height: number, seed: string): Grid {
  const grid: Grid = [];
  // const random = seedrandom(seed);

  for (let y = 0; y < height; y++) {
    grid.push(new Array(width));

    for (let x = 0; x < width; x++) {
      if (y >= height * 0.8) {
        grid[y][x] = 1;
      }
    }
  }

  return grid;
}

export {
  generate
}