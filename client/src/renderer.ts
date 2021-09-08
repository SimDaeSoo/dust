import * as PIXI from 'pixi.js';
import * as PIXI_LAYERS from '@pixi/layers';
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

  for (let i = 0; i < 37; i++) {
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

  const stats = new Stats();
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    sharedLoader: true,
    powerPreference: 'high-performance',
    autoStart: false,
    antialias: false,
    forceCanvas: false,
    preserveDrawingBuffer: false,
    resolution,
  });
  app.stage = new PIXI_LAYERS.Stage();
  app.stage.filters = [new AdvancedBloomFilter({ threshold: 0.4, blur: 4, pixelSize: 1, quality: 4 })];
  app.view.style.width = '100%';
  app.view.style.height = '100%';
  document.body.appendChild(app.view);
  document.body.appendChild(stats.dom);
  await preload();

  const riquidStepOptions: { currentPartition: number, maximum: number, processOrder: number } = { currentPartition: 0, maximum: 40000, processOrder: 0 };
  // Huge World - 8400*2400 - density 0.0005
  // const map: MapData = Map.generate(8400, 2400, 32, `HugeWorld`, {
  //   step: 3,
  //   clearTop: 10,
  //   density: {
  //     block: 0.3,
  //     liquid: 0.008
  //   },
  //   tileTypes: [4],
  //   birthLimit: 3,
  //   deathLimit: 2,
  //   liquidLimit: 4000000
  // });
  // Midium World
  const map: MapData = Map.generate(800, 450, 32, `${Math.random()}`, {
    step: 4,
    clearTop: 3,
    tileTypes: [4],
    density: {
      block: 0.3,
      liquid: 0.3
    },
    birthLimit: 3,
    deathLimit: 2,
    liquidLimit: 2000000
  });
  // Small World
  // const map: MapData = Map.generate(80, 45, 32, `${Math.random()}`, {
  //   step: 4,
  //   clearTop: 3,
  //   tileTypes: [4],
  //   density: {
  //     block: 0.3,
  //     liquid: 1
  //   },
  //   birthLimit: 3,
  //   deathLimit: 2,
  //   liquidLimit: 100000
  // });
  // --------------------------------------------------------------------------
  const stage = new PIXI.Container();
  const texture = PIXI.Texture.WHITE;
  const viewport: Square = { x: 64, y: 64, w: 1280, h: 720 };
  const margin = 4;
  const tilemap = new Tilemap(map, viewport, { margin });
  let targetContainer: any;

  // Graphics
  const maskGraphic = new PIXI.Graphics();
  const lightContainer = new PIXI.Container();

  // Lighting
  const LIGHT_LENGTH = 6;
  const lightingLayer = new PIXI_LAYERS.Layer();
  lightingLayer.useRenderTexture = true;
  lightingLayer.clearColor = [0.075, 0.075, 0.075, 1];
  lightContainer.filters = [new OutlineFilter(Math.floor(map.tileSize / 2), 0xFFFFFF, 0.5), new PIXI.filters.BlurFilter(64)];
  lightContainer.mask = maskGraphic;
  lightContainer.parentLayer = lightingLayer;

  const lightingSprite = new PIXI.Sprite(lightingLayer.getRenderTexture());
  lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

  stage.addChild(tilemap.container);
  stage.addChild(lightContainer);
  stage.addChild(maskGraphic);
  app.stage.addChild(stage);
  app.stage.addChild(lightingLayer);
  app.stage.addChild(lightingSprite);

  // Character
  const characters: Array<{ container: PIXI.Container, vector: Vector, sprite: PIXI.Sprite, lightGraphic: PIXI.Graphics }> = [];
  const characterSize = 8;

  for (let i = 0; i < 1; i++) {
    const container = new PIXI.Container();
    const sprite = new PIXI.Sprite(texture);
    sprite.width = characterSize;
    sprite.height = characterSize;
    sprite.tint = 0xFF0000;
    container.addChild(sprite);
    container.x = 1280 / 2 + Math.round(Math.random() * 400);
    container.y = 720 / 2 + Math.round(Math.random() * 200);
    stage.addChild(container);

    const lightGraphic = new PIXI.Graphics();
    lightGraphic.beginFill(0xFFFFFF, 0.35);
    lightGraphic.drawCircle(0, 0, map.tileSize * 6);
    lightGraphic.endFill();
    lightGraphic.blendMode = PIXI.BLEND_MODES.ADD;

    lightContainer.addChild(lightGraphic);

    const vector = { x: 0, y: 0 };
    characters.push({ container, vector, sprite, lightGraphic });

    setInterval(() => {
      vector.x = (Math.random() - Math.random()) * 2;
      vector.y = (Math.random() - Math.random()) * 2;
    }, 500);

    if (!targetContainer) {
      targetContainer = container;
    }
  }

  let liquidEnvFrame = 0;
  let lightEnvFrame = 0;
  let isLightingFrame;
  let isLiquidFrame;
  let collisionDatas;
  const render = () => {
    isLightingFrame = (++lightEnvFrame % 2) === 0;
    isLiquidFrame = (++liquidEnvFrame % 2) === 1;

    if (isLightingFrame) {
      maskGraphic.clear();
    }

    for (const { container, vector, sprite, lightGraphic } of characters) {
      collisionDatas = Engine.collision({
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
        const isInViewPort: boolean =
          container.x - (map.tileSize * LIGHT_LENGTH) <= viewport.x + viewport.w &&
          container.y - (map.tileSize * LIGHT_LENGTH) <= viewport.y + viewport.h &&
          container.x + characterSize + (map.tileSize * LIGHT_LENGTH) >= viewport.x &&
          container.y + characterSize + (map.tileSize * LIGHT_LENGTH) >= viewport.y;


        if (isInViewPort) {
          sprite.tint = 0xFF00FF;
          const polygon = Lighting.getLightingPolygon({ x: container.x + characterSize / 2, y: container.y + characterSize / 2 }, map, LIGHT_LENGTH);

          maskGraphic.beginFill();
          maskGraphic.drawPolygon(polygon as Array<PIXI.Point>);
          maskGraphic.endFill();

          lightGraphic.x = container.x + characterSize / 2;
          lightGraphic.y = container.y + characterSize / 2;
        } else {
          sprite.tint = 0xFF0000;
        }
      }
    }

    // Test Viewport Draw
    if (isLightingFrame) {
      viewport.x = targetContainer.x - Math.floor(viewport.w / 2);
      viewport.y = targetContainer.y - Math.floor(viewport.h / 2);
      lightEnvFrame = 0;
    }
    if (isLiquidFrame) {
      LiquidSimulator.step(map, riquidStepOptions);
      liquidEnvFrame = 0;
    }
    tilemap.update();
    stage.x = Math.round(640 - targetContainer.x);
    stage.y = Math.round(360 - targetContainer.y);
    app.render();
    stats.update();
    window.requestAnimationFrame(render);
  };

  window.requestAnimationFrame(render);
}

main();