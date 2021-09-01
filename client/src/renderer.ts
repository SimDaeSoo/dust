import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import { Map, Engine, Lighting, Vector, Square } from '@dust/core';
import '../static/index.css';
import Tilemap from './tilemap';

async function preload(): Promise<void> {
  const srcs: Array<string> = [
    '../static/assets/tiles/000.png'
  ];

  return new Promise((resolve) => {
    for (const src of srcs) {
      PIXI.Loader.shared.add(src, src);
    }

    PIXI.Loader.shared.load(() => {
      resolve();
    });
  })
}

async function main(): Promise<void> {
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
  await preload();

  // --------------------------------------------------------------------------
  const width = 2000; // 2000
  const height = 800; // 800
  const tileSize = 16;
  const grid = Map.generate(width, height, Math.random().toString(), { density: 0.35, initLiquid: false });
  const map = {
    seed: 'seed',
    width,
    height,
    tileSize,
    grid
  };
  const texture = PIXI.Texture.WHITE;
  const viewport: Square = { x: 64, y: 64, w: 320, h: 320 };
  const margin = 2;
  const tilemap = new Tilemap(map, viewport, { margin });
  let targetContainer: any;
  app.stage.addChild(tilemap.container);


  // Graphics
  const lightGraphic = new PIXI.Graphics();
  const verticiesGraphic = new PIXI.Graphics();

  // lightGraphic.filters = [new PIXI.filters.BlurFilter()];

  app.stage.addChild(lightGraphic);
  app.stage.addChild(verticiesGraphic);

  // Character
  const characters: Array<{ container: PIXI.Container, vector: Vector, sprite: PIXI.Sprite }> = [];
  const characterSize = 8;

  for (let i = 0; i < 50; i++) {
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
    characters.push({ container, vector, sprite });

    setInterval(() => {
      vector.x = (Math.random() - Math.random()) * 2;
      vector.y = (Math.random() - Math.random()) * 2;
    }, 500);

    if (!targetContainer) {
      targetContainer = container;
    }
  }

  const LIGHTING_FRAME_UPDATE = 1;
  let lightingFrame = 0;

  const render = () => {
    lightingFrame++;
    const isLightingFrame = lightingFrame % LIGHTING_FRAME_UPDATE === 0;
    if (isLightingFrame) {
      lightingFrame = 0;
      lightGraphic.clear();
      verticiesGraphic.clear();
    }

    for (const { container, vector, sprite } of characters) {
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

      if (isLightingFrame) {
        const LIGHT_LENGTH = 8;
        const isInViewPort: boolean =
          container.x - (tileSize * LIGHT_LENGTH) <= viewport.x + viewport.w &&
          container.y - (tileSize * LIGHT_LENGTH) <= viewport.y + viewport.h &&
          container.x + characterSize + (tileSize * LIGHT_LENGTH) >= viewport.x &&
          container.y + characterSize + (tileSize * LIGHT_LENGTH) >= viewport.y;

        if (isInViewPort) {
          sprite.tint = 0xFF00FF;
          const polygon = Lighting.getLightingPolygon({ x: container.x + characterSize / 2, y: container.y + characterSize / 2 }, map, LIGHT_LENGTH);
          lightGraphic.beginFill(0xFFFF00, 0.2);
          lightGraphic.drawPolygon(polygon as Array<PIXI.Point>);
          lightGraphic.endFill();

          const size = 2;
          for (const point of polygon) {
            verticiesGraphic.beginFill(0x00AA00);
            verticiesGraphic.drawPolygon([{ x: point.x - size, y: point.y - size }, { x: point.x + size, y: point.y - size }, { x: point.x + size, y: point.y + size }, { x: point.x - size, y: point.y + size }] as any);
            verticiesGraphic.endFill();
          }
        } else {
          sprite.tint = 0xFF0000;
        }
      }
    }

    // Test Viewport Draw
    if (isLightingFrame) {
      viewport.x = targetContainer.x - Math.floor(viewport.w / 2) + characterSize / 2;
      viewport.y = targetContainer.y - Math.floor(viewport.h / 2) + characterSize / 2;
      verticiesGraphic.lineStyle({ width: 1, color: 0x0000FF });
      verticiesGraphic.drawRect(viewport.x, viewport.y, viewport.w, viewport.h);
      verticiesGraphic.endFill();
    }

    tilemap.update();
    app.render();
    stats.update();
    window.requestAnimationFrame(render);
  };

  window.requestAnimationFrame(render);
}

main();