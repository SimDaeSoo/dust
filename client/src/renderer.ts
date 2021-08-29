import * as PIXI from 'pixi.js';
import { Map, Engine, Lighting, Vector, Line, Dictionary, Point } from '@dust/core';
import '../static/index.css';

const resolution = window.devicePixelRatio || 1;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
PIXI.settings.STRICT_TEXTURE_CACHE = true;

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x000000,
  sharedLoader: true,
  powerPreference: 'high-performance',
  autoStart: false,
  antialias: false,
  forceCanvas: false,
  preserveDrawingBuffer: false,
  resolution,
});

app.view.style.width = '100%';
app.view.style.height = '100%';

document.body.appendChild(app.view);
// for (let i = 0; i < 118; i++) {
//   const src = `../static/assets/characters/body/1/${i.toString().padStart(3, '0')}.png`;
//   PIXI.Loader.shared.add(src, src);
// }

// PIXI.Loader.shared.load(() => {
//   const textures = [];
//   for (let i = 0; i < 118; i++) {
//     const src = `../static/assets/characters/body/1/${i.toString().padStart(3, '0')}.png`;
//     textures.push(PIXI.Texture.from(src));
//   }

//   const animatedSprite = new PIXI.AnimatedSprite(textures);
//   animatedSprite.width = 64;
//   animatedSprite.height = 64;
//   animatedSprite.animationSpeed = 0.2;
//   animatedSprite.x = -32;
//   animatedSprite.y = -64;
//   animatedSprite.play();

//   container.addChild(animatedSprite);
// });

const tileContainer = new PIXI.Container();
const width = 40; // 1000
const height = 22; // 500
const tileSize = 32;
const grid = Map.generate(width, height, Math.random().toString(), 0.35);
const map = {
  seed: 'seed',
  width,
  height,
  tileSize,
  grid
};
const texture = PIXI.Texture.WHITE;

for (let y = 0; y < 22; y++) {
  for (let x = 0; x < 40; x++) {
    if (!grid[y][x] || grid[y][x].movable) continue;
    const sprite = new PIXI.Sprite(texture);

    sprite.width = tileSize;
    sprite.height = tileSize;
    sprite.x = x * tileSize;
    sprite.y = y * tileSize;

    tileContainer.addChild(sprite);
  }
}

app.stage.addChild(tileContainer);
const characters: Array<{ container: PIXI.Container, vector: Vector }> = [];
const characterSize = 12;
const lightGraphic = new PIXI.Graphics();
lightGraphic.filters = [new PIXI.filters.BlurFilter()];
const verticiesGraphic = new PIXI.Graphics();

app.stage.addChild(lightGraphic);
app.stage.addChild(verticiesGraphic);

for (let i = 0; i < 1; i++) {
  const container = new PIXI.Container();
  const sprite = new PIXI.Sprite(texture);
  sprite.width = characterSize;
  sprite.height = characterSize;
  sprite.tint = 0xFF0000;
  container.addChild(sprite);
  container.x = 1280 / 2 + Math.round(Math.random() * 400);
  container.y = 720 / 2 + Math.round(Math.random() * 200);
  app.stage.addChild(container);
  const vector = { x: 0, y: 0 };
  characters.push({
    container,
    vector
  });

  setInterval(() => {
    vector.x = (Math.random() - Math.random()) * 2;
    vector.y = (Math.random() - Math.random()) * 2;
  }, 500);
}

let lastDT = Date.now();
let frame = 0;
const render = () => {
  const dt = Date.now();
  frame++;
  if (dt - lastDT >= 1000) {
    console.log(frame);
    frame = 0;
    lastDT = dt;
  }

  lightGraphic.clear();
  verticiesGraphic.clear();
  for (const { container, vector } of characters) {
    const collisionDatas = Engine.collision({
      square: { x: container.x, y: container.y, w: characterSize, h: characterSize },
      vector: { x: vector.x, y: vector.y }
    }, map);
    const collisionDirection: { x: boolean, y: boolean } = { x: false, y: false };
    for (const collisionData of collisionDatas) {
      switch (collisionData.direction) {
        case 3: {
          collisionDirection.y = true;
          container.y = collisionData.line[0].y - characterSize;
          break;
        }
        case 2: {
          collisionDirection.y = true;
          container.y = collisionData.line[0].y;
          break;
        }
        case 1: {
          collisionDirection.x = true;
          container.x = collisionData.line[0].x - characterSize;
          break;
        }
        case 0: {
          collisionDirection.x = true;
          container.x = collisionData.line[0].x;
          break;
        }
      }
    }
    if (!collisionDirection.x) container.x += vector.x;
    if (!collisionDirection.y) container.y += vector.y;

    const polygon = Lighting.getLightingPolygon({ x: container.x + characterSize / 2, y: container.y + characterSize / 2 }, map, 8);
    lightGraphic.beginFill(0xFFFFFF, 0.3);
    lightGraphic.drawPolygon(polygon as any);
    lightGraphic.endFill();

    const size = 2;
    for (const point of polygon) {
      verticiesGraphic.beginFill(0xFF0000);
      verticiesGraphic.drawPolygon([{ x: point.x - size, y: point.y - size }, { x: point.x + size, y: point.y - size }, { x: point.x + size, y: point.y + size }, { x: point.x - size, y: point.y + size }] as any);
      verticiesGraphic.endFill();
    }
  }

  app.render();
  window.requestAnimationFrame(render);
};

// const update = (dt: number) => {
//   container.y += 1;

//   // const collisionDT = Engine.vectorSquareInterSection()
//   console.log('update', dt);
// };

function getLineGraphics(lines: any) {
  return lines.map((line: any) => {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xFF0000);
    graphics.drawRoundedRect(line[0].x - 1 / 2, line[0].y - 1 / 2, (line[1].x - line[0].x) + 1, (line[1].y - line[0].y) + 1, 1 / 2);
    graphics.endFill();

    return graphics;
  });
}

function getVertexGraphics(vertices: any) {
  return vertices.map((vertex: any) => {
    const graphics = new PIXI.Graphics();

    graphics.beginFill(0x00AAAA);
    graphics.drawRect(vertex.x - 4 / 2, vertex.y - 4 / 2, 4, 4);
    graphics.endFill();

    return graphics;
  });
}

window.requestAnimationFrame(render);