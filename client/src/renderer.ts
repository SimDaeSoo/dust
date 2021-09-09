import * as PIXI from 'pixi.js';
import * as PIXI_LAYERS from '@pixi/layers';
import Stats from 'stats.js';
import { Map, Engine, Lighting, Vector, Square, MapData, LiquidSimulator, Point } from '@dust/core';
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
  // const map: MapData = Map.generate({
  //   seed: 'HugeWorld',
  //   width: 8400,
  //   height: 2400,
  //   tileSize: 32,
  //   step: 3,
  //   clearTop: 0,
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
  const map: MapData = Map.generate({
    seed: `${Math.random()}`,
    width: 450,
    height: 450,
    tileSize: 32,
    step: 4,
    clearTop: 0,
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
  // const map: MapData = Map.generate({
  //   seed: `${Math.random()}`,
  //   width: 80,
  //   height: 45,
  //   tileSize: 32,
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
  const LIGHT_LENGTH = 8;
  const lightingLayer = new PIXI_LAYERS.Layer();
  const blurFilter = new PIXI.filters.BlurFilter(64, 8, 1, 15);
  blurFilter.autoFit = false;
  lightingLayer.useRenderTexture = true;
  lightingLayer.clearColor = [0.075, 0.075, 0.075, 1];
  lightingLayer.filters = [blurFilter];

  const outlineFilter = new OutlineFilter(Math.floor(map.tileSize / 2), 0xFFFFFF);
  lightContainer.mask = maskGraphic;
  lightContainer.parentLayer = lightingLayer;
  lightContainer.filters = [outlineFilter];

  const lightingSprite = new PIXI.Sprite(lightingLayer.getRenderTexture());
  lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

  stage.addChild(tilemap.container);
  stage.addChild(lightContainer);
  stage.addChild(maskGraphic);
  app.stage.addChild(stage);
  app.stage.addChild(lightingLayer);
  app.stage.addChild(lightingSprite);

  // Character
  const characters: Array<{ container: PIXI.Container, vector: Vector, sprite: PIXI.Sprite, lightGraphic: PIXI.Graphics, lightPolygon: Array<Point>, prevPosition: Point }> = [];
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
    lightGraphic.beginFill(0xFFFFFF, 0.5);
    lightGraphic.drawCircle(0, 0, map.tileSize * LIGHT_LENGTH);
    lightGraphic.endFill();
    lightGraphic.blendMode = PIXI.BLEND_MODES.ADD;

    lightContainer.addChild(lightGraphic);

    const vector = { x: 0, y: 0 };
    characters.push({ container, vector, sprite, lightGraphic, lightPolygon: [], prevPosition: { x: container.x, y: container.y } });

    setInterval(() => {
      vector.x = (Math.random() - Math.random()) * 2;
      vector.y = (Math.random() - Math.random()) * 2;
    }, 500);

    if (!targetContainer) {
      targetContainer = container;
    }
  }

  let ENV_FRAME = 0;
  let collisionDatas;

  const render = () => {
    ENV_FRAME = (ENV_FRAME + 1) % 2;
    maskGraphic.clear();

    for (let i = 0; i < characters.length; i++) {
      collisionDatas = Engine.collision({
        square: { x: characters[i].container.x, y: characters[i].container.y, w: characterSize, h: characterSize },
        vector: { x: characters[i].vector.x, y: characters[i].vector.y }
      }, map);
      const collisionDirection: { x: boolean, y: boolean } = { x: false, y: false };
      for (const collisionData of collisionDatas) {
        switch (collisionData.direction) {
          case 3: {
            collisionDirection.y = true;
            characters[i].container.y = collisionData.line[0].y - characterSize;
            break;
          }
          case 2: {
            collisionDirection.y = true;
            characters[i].container.y = collisionData.line[0].y;
            break;
          }
          case 1: {
            collisionDirection.x = true;
            characters[i].container.x = collisionData.line[0].x - characterSize;
            break;
          }
          case 0: {
            collisionDirection.x = true;
            characters[i].container.x = collisionData.line[0].x;
            break;
          }
        }
      }
      if (!collisionDirection.x) characters[i].container.x += characters[i].vector.x;
      if (!collisionDirection.y) characters[i].container.y += characters[i].vector.y;

      const isInViewPort: boolean =
        characters[i].container.x - (map.tileSize * LIGHT_LENGTH) <= viewport.x + viewport.w &&
        characters[i].container.y - (map.tileSize * LIGHT_LENGTH) <= viewport.y + viewport.h &&
        characters[i].container.x + characterSize + (map.tileSize * LIGHT_LENGTH) >= viewport.x &&
        characters[i].container.y + characterSize + (map.tileSize * LIGHT_LENGTH) >= viewport.y;


      if (isInViewPort) {
        characters[i].sprite.tint = 0xFF00FF;

        if (ENV_FRAME % 2 === 1 && Math.sqrt((characters[i].prevPosition.x - characters[i].container.x) ** 2 + (characters[i].prevPosition.y - characters[i].container.y) ** 2) >= 1) {
          characters[i].lightPolygon = Lighting.getLightingPolygon({ x: characters[i].container.x + characterSize / 2, y: characters[i].container.y + characterSize / 2 }, map, LIGHT_LENGTH);
          characters[i].prevPosition.x = characters[i].container.x;
          characters[i].prevPosition.y = characters[i].container.y;
        }

        maskGraphic.beginFill();
        maskGraphic.drawPolygon(characters[i].lightPolygon as Array<PIXI.Point>);
        maskGraphic.endFill();

        characters[i].lightGraphic.x = characters[i].container.x + characterSize / 2;
        characters[i].lightGraphic.y = characters[i].container.y + characterSize / 2;
      } else {
        characters[i].sprite.tint = 0xFF0000;
      }
    }

    // Test Viewport Draw
    viewport.x = targetContainer.x - Math.floor(viewport.w / 2);
    viewport.y = targetContainer.y - Math.floor(viewport.h / 2);

    if (ENV_FRAME % 2 === 0) LiquidSimulator.step(map, riquidStepOptions);

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