import { MapData, Point } from "../interfaces";
import { getLightingPolygon } from "../modules/Lighting";
import { print, generate } from "../modules/Map";
import { step } from '../modules/LiquidSimulator';

async function main(): Promise<void> {
  await lightingTest();
  await liquidTest();
  await largeWorldLiquidSpeedTest();
}

function sleep(dt: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, dt);
  })
}

async function lightingTest(): Promise<void> {
  const seed: string = `${Math.random()}`;
  const width: number = 159;
  const height: number = 35;
  const tileSize: number = 4;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed, { density: 0.3, initLiquid: false })
  };
  const position: Point = { x: 198, y: 58 };
  const tiles = getLightingPolygon(position, map, 10, { getTiles: true });
  const polygon = getLightingPolygon(position, map, 10);
  print(map, { checkPoints: [{ position, color: '\x1b[33m', marker: '◈' }] });
  console.log(new Array(width).fill('-').toString().replace(/,/g, '-'));
  console.log('Grid searching map visualizations');

  print(map, { checkPoints: [...tiles.map(({ x, y }) => ({ position: { x: x * tileSize, y: y * tileSize }, color: '\x1b[31m', marker: '◈' })), { position, color: '\x1b[33m', marker: '◈' }] });
  console.log('Lighting Polygon is :', polygon, '\n');
  console.log('Lighting Test Done...');
  console.log('After 5 seconds the next test starts');
  await sleep(5000);
}

async function liquidTest(): Promise<void> {
  const seed: string = `${Math.random()}`;
  const width: number = 159;
  const height: number = 35;
  const tileSize: number = 4;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed, { density: 0.3, initLiquid: true })
  };
  console.clear();
  print(map);

  for (let i = 0; i < 500; i++) {
    const lastDt = Date.now();
    step(map);
    const dt = Date.now() - lastDt;
    console.clear();
    print(map);
    console.log(dt, 'ms');
    await sleep(16);
  }

  console.log('Liquid Step Test Done...');
  console.log('After 5 seconds the next test starts');
  await sleep(5000);
}

async function largeWorldLiquidSpeedTest() {
  const seed: string = `${Math.random()}`;
  const width: number = 1000;
  const height: number = 500;
  const tileSize: number = 1;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed, { density: 0.3, initLiquid: true })
  };
  console.clear();

  let average = 0;
  let options: any = { currentPartition: 0, maximum: 10000, flow: 0 };
  for (let i = 0; i < 2000; i++) {
    const lastDt = Date.now();
    options = step(map, options);
    const dt = Date.now() - lastDt;
    average += dt;
    console.clear();
    console.log(dt, 'ms', '/ average', (average / (i + 1)).toFixed(2), 'ms\n');
  }
  console.log(`width: ${width}`);
  console.log(`height: ${height}`);
  console.log(`grid: ${width * height} tiles`);
  console.log(`partition grid: ${options.maximum}`);
  console.log(`liquid processing per frame: ${(width * height / options.maximum).toFixed(2)}`);
  console.log(`liquid processing per ms: ${(width * height / options.maximum * 16.6666).toFixed(2)} ms\n`);

  console.log('Large World Liquid Performance Test Done...');
}

main();