import { MapData } from "../interfaces";
import { print, generate } from "../modules/Map";
import { step } from '../modules/LiquidSimulator';

async function fullLiquidTest(): Promise<void> {
  const map: MapData = generate({
    width: 50,
    height: 35,
    tileSize: 4,
    seed: `${Math.random()}`,
    step: 3,
    clearTop: 50,
    density: {
      block: 0,
      liquid: 1
    },
    tileTypes: [1],
    birthLimit: 3,
    deathLimit: 2,
    liquidLimit: 2000000
  });
  console.clear();
  print(map);
  console.log('After 2 seconds the next test starts');
  await sleep(2000);

  let options = { currentPartition: 0, maximum: 40000, processOrder: 0 };
  let average = 0;
  let stepCount = 0;
  let max = 0;
  while (map.unstables[0].length) {
    const lastDt = Date.now();
    step(map, options);
    const dt = Date.now() - lastDt;
    max = max < dt ? dt : max;
    average += dt;
    stepCount++;
    console.clear();
    print(map);
    console.log('step: ', stepCount);
    console.log('unstable liquid:', map.unstables[0].length);
    console.log('processing per ms:', dt, 'ms');
    console.log('processing average per ms:', (average / stepCount).toFixed(2), 'ms');
    console.log('processing max ms:', max, 'ms');
    console.log('bottom density:', map.grid[map.grid.length - 1][0].liquid);
    await sleep(50);
  }

  console.log('Liquid Step Test Done...');
  console.log('After 2 seconds the next test starts');
  await sleep(2000);
}

async function liquidTest(): Promise<void> {
  const map: MapData = generate({
    width: 50,
    height: 35,
    tileSize: 4,
    seed: `${Math.random()}`,
    step: 3,
    clearTop: 10,
    density: {
      block: 0.3,
      liquid: 0.2
    },
    tileTypes: [1],
    birthLimit: 3,
    deathLimit: 2,
    liquidLimit: 2000000
  });
  console.clear();
  print(map);
  console.log('After 2 seconds the next test starts');
  await sleep(2000);

  let options = { currentPartition: 0, maximum: 40000, processOrder: 0 };
  let average = 0;
  let stepCount = 0;
  let max = 0;
  while (map.unstables[0].length) {
    const lastDt = Date.now();
    step(map, options);
    const dt = Date.now() - lastDt;
    max = max < dt ? dt : max;
    average += dt;
    stepCount++;
    console.clear();
    print(map);
    console.log('step: ', stepCount);
    console.log('unstable liquid:', map.unstables[0].length);
    console.log('processing per ms:', dt, 'ms');
    console.log('processing average per ms:', (average / stepCount).toFixed(2), 'ms');
    console.log('processing max ms:', max, 'ms');
    await sleep(50);
  }

  console.log('Liquid Step Test Done...');
  console.log('After 2 seconds the next test starts');
  await sleep(2000);
}

async function largeWorldLiquidTest(): Promise<void> {
  const map: MapData = generate({
    width: 8400,
    height: 2400,
    tileSize: 4,
    seed: `HugeWorld`,
    step: 3,
    clearTop: 10,
    density: {
      block: 0.3,
      liquid: 0.008
    },
    tileTypes: [1],
    birthLimit: 3,
    deathLimit: 2,
    liquidLimit: 2000000
  });
  console.clear();

  let options = { currentPartition: 0, maximum: 40000, processOrder: 0 };
  let average = 0;
  let stepCount = 0;
  let max = 0;
  let maxLiquid = 0;
  while (map.unstables[0].length || map.unstables[1].length) {
    const lastDt = Date.now();
    step(map, options);
    const dt = Date.now() - lastDt;
    max = max < dt ? dt : max;
    average += dt;
    maxLiquid = maxLiquid < map.unstables[0].length ? map.unstables[0].length : maxLiquid;
    stepCount++;
    console.clear();
    console.log('step: ', stepCount);
    console.log('max unstable liquid:', maxLiquid);
    console.log('unstable liquid:', map.unstables[0].length);
    console.log('next unstable liquid:', map.unstables[1].length);
    console.log('processing per ms:', dt, 'ms');
    console.log('processing average per ms:', (average / stepCount).toFixed(2), 'ms');
    console.log('processing max ms:', max, 'ms');
  }

  console.log('Partitioning Liquid Step Test Done...');
  console.log('After 2 seconds the next test starts');
  await sleep(2000);
}

async function partitioningLiquidTest(): Promise<void> {
  const map: MapData = generate({
    width: 50,
    height: 35,
    tileSize: 4,
    seed: `${Math.random()}`,
    step: 3,
    clearTop: 10,
    density: {
      block: 0.3,
      liquid: 0.05
    },
    tileTypes: [1],
    birthLimit: 3,
    deathLimit: 2,
    liquidLimit: 2000000
  });
  console.clear();

  let options = { currentPartition: 0, maximum: 400, processOrder: 0 };
  let average = 0;
  let stepCount = 0;
  let max = 0;
  while (map.unstables[0].length || map.unstables[1].length) {
    const lastDt = Date.now();
    step(map, options);
    const dt = Date.now() - lastDt;
    max = max < dt ? dt : max;
    average += dt;
    stepCount++;
    console.clear();
    print(map);
    console.log('step: ', stepCount);
    console.log('unstable liquid:', map.unstables[0].length);
    console.log('next unstable liquid:', map.unstables[1].length);
    console.log('processing per ms:', dt, 'ms');
    console.log('processing average per ms:', (average / stepCount).toFixed(2), 'ms');
    console.log('processing max ms:', max, 'ms');
    await sleep(50);
  }

  console.log('Partitioning Liquid Step Test Done...');
  console.log('After 2 seconds the next test starts');
  await sleep(2000);
}

function sleep(dt: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, dt);
  })
}

export {
  liquidTest,
  largeWorldLiquidTest,
  fullLiquidTest,
  partitioningLiquidTest
}