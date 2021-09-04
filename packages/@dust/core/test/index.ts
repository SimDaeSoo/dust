import { MapData, Point } from "../interfaces";
import { getLightingPolygon } from "../modules/Lighting";
import { print, generate, getDefaultUnstablePoints } from "../modules/Map";
import { step } from '../modules/LiquidSimulator';

async function main(): Promise<void> {
  await lightingTest();
  await liquidTest();
  await hugeWorldLiquidTest();
}

function sleep(dt: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, dt);
  })
}

async function lightingTest(): Promise<void> {
  const width: number = 35;
  const height: number = 35;
  const tileSize: number = 4;

  for (let i = 0; i < 10; i++) {
    const seed: string = `${Math.random()}`;
    const map: MapData = {
      seed,
      width,
      height,
      tileSize,
      grid: generate(width, height, seed, { density: 0.3, initLiquid: false }),
      unstablePoints: [],
      nextUnstablePoints: []
    };
    const position: Point = { x: 50, y: 50 };
    map.grid[Math.floor(position.y / tileSize)][Math.floor(position.x / tileSize)].movable = true;

    const tiles = getLightingPolygon(position, map, 10, { getTiles: true });
    const polygon = getLightingPolygon(position, map, 10);
    console.clear();
    print(map, { checkPoints: [{ position, color: '\x1b[31m', marker: '■' }] });
    console.log(new Array(width).fill('-').toString().replace(/,/g, '-'));
    console.log('Grid searching map visualizations');
    console.log('After 5 seconds the next test starts');
    await sleep(500);

    console.clear();
    print(map, {
      checkPoints: [
        ...tiles.map(({ x, y }) => ({ position: { x: x * tileSize, y: y * tileSize }, color: '\x1b[30m', marker: '◈' })),
        { position: { x: position.x + tileSize, y: position.y }, color: '\x1b[30m', marker: '◈' },
        { position: { x: position.x - tileSize, y: position.y }, color: '\x1b[30m', marker: '◈' },
        { position: { x: position.x, y: position.y + tileSize }, color: '\x1b[30m', marker: '◈' },
        { position: { x: position.x, y: position.y - tileSize }, color: '\x1b[30m', marker: '◈' },
        { position, color: '\x1b[31m', marker: '■' },
      ]
    });
    console.log('Lighting Polygon is :', polygon, '\n');
    await sleep(500);
  }

  console.log('Lighting Test Done...');
  console.log('After 5 seconds the next test starts');
  await sleep(5000);
}

async function liquidTest(): Promise<void> {
  const seed: string = `${Math.random()}`;
  const width: number = 35;
  const height: number = 35;
  const tileSize: number = 4;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed, { density: 0.3, initLiquid: true }),
    unstablePoints: [],
    nextUnstablePoints: []
  };
  console.clear();
  print(map);
  const unstables: Array<Point> = getDefaultUnstablePoints(map);

  for (const point of unstables) {
    map.unstablePoints.push(point);
  }
  console.log('After 5 seconds the next test starts');
  await sleep(5000);

  let options = { currentPartition: 0, maximum: 40000, processOrder: 0 };
  let average = 0;
  let stepCount = 0;
  let max = 0;
  while (map.unstablePoints.length) {
    const lastDt = Date.now();
    options = step(map, options);
    const dt = Date.now() - lastDt;
    max = max < dt ? dt : max;
    average += dt;
    stepCount++;
    console.clear();
    print(map);
    console.log('step: ', stepCount);
    console.log('unstable liquid:', map.unstablePoints.length);
    console.log('processing per ms:', dt, 'ms');
    console.log('processing average per ms:', (average / stepCount).toFixed(2), 'ms');
    console.log('processing max ms:', max, 'ms');
    await sleep(100);
  }

  console.log('Liquid Step Test Done...');
  console.log('After 5 seconds the next test starts');
  await sleep(5000);
}

async function hugeWorldLiquidTest(): Promise<void> {
  const seed: string = `${Math.random()}`;
  const width: number = 1280;
  const height: number = 720;
  const tileSize: number = 4;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed, { density: 0.3, initLiquid: true }),
    unstablePoints: [],
    nextUnstablePoints: []
  };
  console.clear();
  const unstables: Array<Point> = getDefaultUnstablePoints(map);

  for (const point of unstables) {
    map.unstablePoints.push(point);
  }

  let options = { currentPartition: 0, maximum: 40000, processOrder: 0 };
  let average = 0;
  let stepCount = 0;
  let max = 0;
  while (map.unstablePoints.length) {
    const lastDt = Date.now();
    options = step(map, options);
    const dt = Date.now() - lastDt;
    max = max < dt ? dt : max;
    average += dt;
    stepCount++;
    console.clear();
    console.log('step: ', stepCount);
    console.log('unstable liquid:', map.unstablePoints.length);
    console.log('processing per ms:', dt, 'ms');
    console.log('processing average per ms:', (average / stepCount).toFixed(2), 'ms');
    console.log('processing max ms:', max, 'ms');
  }

  console.log('Huge World Liquid Step Test Done...');
  await sleep(5000);
}

main();