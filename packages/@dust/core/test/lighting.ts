import { MapData, Point } from "../interfaces";
import { getLightingPolygon } from "../modules/Lighting";
import { print, generate } from "../modules/Map";

async function lightingTest(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    const map: MapData = generate(50, 35, 4, `${Math.random()}`, {
      step: 3,
      density: {
        block: 0.3,
        liquid: 0
      },
      tileTypes: [1],
      clearTop: 10,
      birthLimit: 3,
      deathLimit: 2,
      liquidLimit: 3000000
    });
    const position: Point = getVaildPosition(map);
    position.x *= map.tileSize;
    position.y *= map.tileSize;

    const tiles = getLightingPolygon(position, map, 10, { getTiles: true });

    console.clear();
    print(map, { checkPoints: [{ position, color: '\x1b[31m', marker: '■' }] });
    console.log('sight length :', 10);

    await sleep(500);

    console.clear();
    print(map, {
      checkPoints: [
        ...tiles.map(({ x, y }) => ({ position: { x: x * map.tileSize, y: y * map.tileSize }, color: '\x1b[30m', marker: '◈' })),
        { position: { x: position.x + map.tileSize, y: position.y }, color: '\x1b[30m', marker: '◈' },
        { position: { x: position.x - map.tileSize, y: position.y }, color: '\x1b[30m', marker: '◈' },
        { position: { x: position.x, y: position.y + map.tileSize }, color: '\x1b[30m', marker: '◈' },
        { position: { x: position.x, y: position.y - map.tileSize }, color: '\x1b[30m', marker: '◈' },
        { position, color: '\x1b[31m', marker: '■' },
      ]
    });
    console.log('sight length :', 10);

    await sleep(500);
  }

  console.log('Lighting Test Done...');
  console.log('After 2 seconds the next test starts');
  await sleep(2000);
}

function getVaildPosition(map: MapData): Point {
  const vaildPositions: Array<Point> = [];

  for (let y = 1; y < map.height - 1; y++) {
    for (let x = 1; x < map.width - 1; x++) {
      if (map.grid[y][x].movable) vaildPositions.push({ x, y });
    }
  }

  return vaildPositions[Math.floor(Math.random() * vaildPositions.length)];
}

function sleep(dt: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, dt);
  })
}

export {
  lightingTest
}