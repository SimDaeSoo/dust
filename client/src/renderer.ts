import * as PIXI from 'pixi.js';
import { OutlineFilter } from 'pixi-filters';
import Stats from 'stats.js';
import { Map, Point, Engine, Lighting, Vector, Square } from '@dust/core';
import '../static/index.css';
import Tilemap from './tilemap';

const resolution = window.devicePixelRatio || 1;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
PIXI.settings.STRICT_TEXTURE_CACHE = true;

const stats = new Stats();
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
document.body.appendChild(stats.dom);

// --------------------------------------------------------------------------
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
const viewport: Square = { x: 64, y: 64, w: 320, h: 320 };
const margin = 1;
let targetContainer: any;
const tilemap = new Tilemap(map, viewport, { margin });
app.stage.addChild(tilemap.container);

// app.stage.filters = [new AdvancedBloomFilter()];
const characters: Array<{ container: PIXI.Container, vector: Vector }> = [];
const characterSize = 12;
const lightGraphic = new PIXI.Graphics();

lightGraphic.filters = [new OutlineFilter(4, 0xFFFFFF), new PIXI.filters.BlurFilter()];
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
  if (!targetContainer) targetContainer = container;

  setInterval(() => {
    vector.x = (Math.random() - Math.random()) * 2;
    vector.y = (Math.random() - Math.random()) * 2;
  }, 500);
}

const render = () => {
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
    lightGraphic.drawPolygon(polygon as Array<PIXI.Point>);
    lightGraphic.endFill();

    const size = 2;
    for (const point of polygon) {
      verticiesGraphic.beginFill(0xFF0000);
      verticiesGraphic.drawPolygon([{ x: point.x - size, y: point.y - size }, { x: point.x + size, y: point.y - size }, { x: point.x + size, y: point.y + size }, { x: point.x - size, y: point.y + size }] as any);
      verticiesGraphic.endFill();
    }
  }
  // Test Viewport Draw
  viewport.x = targetContainer.x - 160 + characterSize / 2;
  viewport.y = targetContainer.y - 160 + characterSize / 2;
  verticiesGraphic.lineStyle({ width: 1, color: 0x0000FF });
  verticiesGraphic.drawRect(viewport.x, viewport.y, viewport.w, viewport.h);
  verticiesGraphic.endFill();

  tilemap.update();
  app.render();
  stats.update();
  window.requestAnimationFrame(render);
};

window.requestAnimationFrame(render);

// ---------------------------------------------------------------------------------
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
//   animatedSprite.animationSpeed = 1;
//   animatedSprite.x = -32;
//   animatedSprite.y = -64;
//   animatedSprite.play();

//   container.addChild(animatedSprite);
// });