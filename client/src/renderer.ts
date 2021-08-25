import * as PIXI from 'pixi.js';
import { Map, Engine, DIRECTION } from '@dust/core';
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
const width = 320;
const height = 175;
const tileSize = 4;
const grid = Map.generate(width, height, Math.random().toString());
const texture = PIXI.Texture.WHITE;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (!grid[y][x] || grid[y][x].movable) continue;
    const sprite = new PIXI.Sprite(texture);

    sprite.width = tileSize;
    sprite.height = tileSize;
    sprite.x = x * tileSize;
    sprite.y = y * tileSize;

    tileContainer.addChild(sprite);
  }
}

const characterSize = 4;
const container = new PIXI.Container();
const sprite = new PIXI.Sprite(texture);
sprite.width = characterSize;
sprite.height = characterSize;
sprite.tint = 0xff0000;
container.addChild(sprite);
container.x = 16;

// container.x = 32;
// container.y = 64;

app.stage.addChild(tileContainer);
app.stage.addChild(container);
// app.stage.addChild(container);

const vector = { x: 0, y: 0 };
// let lastDT = Date.now();

const render = () => {
  //   const dt = Date.now() - lastDT;
  //   update(dt);
  const collisionDatas = Engine.collision({
    square: { x: container.x, y: container.y, w: characterSize, h: characterSize },
    vector: { x: vector.x, y: vector.y }
  }, {
    seed: 'seed',
    width,
    height,
    tileSize,
    grid
  });
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

  app.render();
  //   lastDT = Date.now();
  window.requestAnimationFrame(render);
};

// const update = (dt: number) => {
//   container.y += 1;

//   // const collisionDT = Engine.vectorSquareInterSection()
//   console.log('update', dt);
// };

window.requestAnimationFrame(render);

window.addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'ArrowDown': {
      vector.y = 1;
      break;
    }
    case 'ArrowUp': {
      vector.y = -1;
      break;
    }
    case 'ArrowRight': {
      vector.x = 1;
      break;
    }
    case 'ArrowLeft': {
      vector.x = -1;
      break;
    }
  }
});

window.addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'ArrowDown': {
      vector.y = 0;
      break;
    }
    case 'ArrowUp': {
      vector.y = 0;
      break;
    }
    case 'ArrowRight': {
      vector.x = 0;
      break;
    }
    case 'ArrowLeft': {
      vector.x = 0;
      break;
    }
  }
})