import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import { Map, Engine, Lighting, Vector, Square, MapData, LiquidSimulator } from '@dust/core';
import '../static/index.css';
import Tilemap from './tilemap';
import { TILEMAP_DATA } from './constants';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';

async function preload(): Promise<void> {
  const srcs: Array<string> = [];

  for (const key of TILEMAP_DATA) {
    for (let i = 1; i <= 60; i++) {
      const src = `../static/assets/tiles/${key}/Tile_${i.toString().padStart(2, '0')}.png`;
      srcs.push(src);
    }
  }

  for (let i = 0; i < 36; i++) {
    const src = `../static/assets/tiles/water/${i.toString().padStart(2, '0')}.png`;
    srcs.push(src);
  }

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
  PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.LOW;
  PIXI.settings.PRECISION_VERTEX = PIXI.PRECISION.LOW;

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

  const riquidStepOptions: { currentPartition: number, maximum: number, processOrder: number } = { currentPartition: 0, maximum: 40000, processOrder: 0 };
  const map: MapData = Map.generate(40, 23, 32, `${Math.random()}`, {
    step: 4,
    clearTop: 3,
    tileTypes: [4],
    density: {
      block: 0.3,
      liquid: 0.3
    },
    birthLimit: 3,
    deathLimit: 2
  });
  // --------------------------------------------------------------------------
  const texture = PIXI.Texture.WHITE;
  const viewport: Square = { x: 64, y: 64, w: 1280, h: 720 };
  const margin = 2;
  const tilemap = new Tilemap(map, viewport, { margin });
  let targetContainer: any;
  app.stage.addChild(tilemap.container);

  // Graphics
  const lightGraphic = new PIXI.Graphics();
  const verticiesGraphic = new PIXI.Graphics();

  // Test Light Filters
  app.stage.filters = [new AdvancedBloomFilter({ quality: 8 })];
  lightGraphic.filters = [new OutlineFilter(Math.floor(map.tileSize / 2), 0xFFFFFF, 0.5)];

  app.stage.addChild(lightGraphic);
  app.stage.addChild(verticiesGraphic);

  // Character
  const characters: Array<{ container: PIXI.Container, vector: Vector, sprite: PIXI.Sprite }> = [];
  const characterSize = 16;

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
    characters.push({ container, vector, sprite });

    setInterval(() => {
      vector.x = (Math.random() - Math.random()) * 2;
      vector.y = (Math.random() - Math.random()) * 2;
    }, 500);

    if (!targetContainer) {
      targetContainer = container;
    }
  }

  let envFrame = 0;
  const render = () => {
    envFrame++;
    const isLightingFrame = envFrame % 2 === 0;
    const isLiquidFrame = !isLightingFrame;

    if (isLightingFrame) {
      envFrame = 0;
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
        const LIGHT_LENGTH = 6;
        const isInViewPort: boolean =
          container.x - (map.tileSize * LIGHT_LENGTH) <= viewport.x + viewport.w &&
          container.y - (map.tileSize * LIGHT_LENGTH) <= viewport.y + viewport.h &&
          container.x + characterSize + (map.tileSize * LIGHT_LENGTH) >= viewport.x &&
          container.y + characterSize + (map.tileSize * LIGHT_LENGTH) >= viewport.y;

        if (isInViewPort) {
          sprite.tint = 0xFF00FF;
          const polygon = Lighting.getLightingPolygon({ x: container.x + characterSize / 2, y: container.y + characterSize / 2 }, map, LIGHT_LENGTH);
          lightGraphic.beginFill(0xFFFFFF, 0.2);
          lightGraphic.drawPolygon(polygon as Array<PIXI.Point>);
          lightGraphic.endFill();

          // const size = 4;
          // verticiesGraphic.beginFill(0xFF0000);
          // for (const point of polygon) {
          //   verticiesGraphic.drawRect(point.x - size / 2, point.y - size / 2, size, size);
          // }
          // verticiesGraphic.endFill();
        } else {
          sprite.tint = 0xFF0000;
        }
      }
    }

    // Test Viewport Draw
    if (isLightingFrame) {
      viewport.x = targetContainer.x - Math.floor(viewport.w / 2);
      viewport.y = targetContainer.y - Math.floor(viewport.h / 2);
      // verticiesGraphic.lineStyle({ width: 2, color: 0x0000FF });
      // verticiesGraphic.drawRect(viewport.x, viewport.y, viewport.w, viewport.h);
      // verticiesGraphic.endFill();
    }
    if (isLiquidFrame) {
      LiquidSimulator.step(map, riquidStepOptions);
    }
    tilemap.update();
    app.render();
    stats.update();
    app.stage.x = 640 - targetContainer.x;
    app.stage.y = 360 - targetContainer.y;
    window.requestAnimationFrame(render);
  };

  window.requestAnimationFrame(render);
}

main();