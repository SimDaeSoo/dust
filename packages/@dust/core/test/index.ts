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
  const width: number = 186;
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
  print(map, { checkPoints: [{ position, color: '\x1b[31m', marker: '■' }] });
  console.log(new Array(width).fill('-').toString().replace(/,/g, '-'));
  console.log('Grid searching map visualizations');

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
  console.log('Lighting Test Done...');
  console.log('After 5 seconds the next test starts');
  await sleep(5000);
}

async function liquidTest(): Promise<void> {
  const seed: string = `${Math.random()}`;
  const width: number = 186;
  const height: number = 60;
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

  for (let i = 0; i < 300; i++) {
    const lastDt = Date.now();
    step(map);
    const dt = Date.now() - lastDt;
    console.clear();
    print(map);
    console.log('processing per ms:', dt, 'ms');
    await sleep(64);
  }

  console.log('Liquid Step Test Done...');
  console.log('After 5 seconds the next test starts');
  await sleep(5000);
}

async function largeWorldLiquidSpeedTest() {
  const seed: string = `${Math.random()}`;
  const width: number = 8400;
  const height: number = 2400;
  const tileSize: number = 1;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed, { density: 0.3, initLiquid: true }),
  };
  console.clear();

  for (let j = 1; j <= 20; j++) {
    const maximum = j * 10000;
    let average = 0;
    let options: any = { currentPartition: 0, maximum, flow: 0 };
    for (let i = 0; i <= width * height / maximum + 1; i++) {
      const lastDt = Date.now();
      options = step(map, options);
      const dt = Date.now() - lastDt;
      average += dt;
    }
    console.log(`width: ${width}`);
    console.log(`height: ${height}`);
    console.log(`grid: ${width * height} tiles`);
    console.log(`partition grid: ${maximum} tiles`);
    console.log('average', (average / 50).toFixed(2), 'ms');
    console.log(`liquid processing per frame: ${(width * height / maximum).toFixed(2)}`);
    console.log(`liquid processing per ms: ${(width * height / maximum * 16.6666).toFixed(2)} ms\n`);
    console.log('-------------------------------------');
  }

  console.log('\n')
  console.log('Large World Liquid Performance Test Done...');
  await sleep(5000);
}

main();