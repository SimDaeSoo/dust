import * as PIXI from 'pixi.js';
import { Map, Engine } from '@dust/core';
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

const container = new PIXI.Container();
for (let i = 0; i < 118; i++) {
  const src = `../static/assets/characters/body/1/${i.toString().padStart(3, '0')}.png`;
  PIXI.Loader.shared.add(src, src);
}

PIXI.Loader.shared.load(() => {
  const textures = [];
  for (let i = 0; i < 118; i++) {
    const src = `../static/assets/characters/body/1/${i.toString().padStart(3, '0')}.png`;
    textures.push(PIXI.Texture.from(src));
  }

  const animatedSprite = new PIXI.AnimatedSprite(textures);
  animatedSprite.width = 64;
  animatedSprite.height = 64;
  animatedSprite.animationSpeed = 0.2;
  animatedSprite.x = -32;
  animatedSprite.y = -64;
  animatedSprite.play();

  container.addChild(animatedSprite);
});

const tileContainer = new PIXI.Container();
const width = 100;
const height = 50;
const tileSize = 16;
const grid = Map.generate(width, height, 'randomseed');
const texture = PIXI.Texture.WHITE;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (!grid[y][x]) continue;
    const sprite = new PIXI.Sprite(texture);

    sprite.width = tileSize;
    sprite.height = tileSize;
    sprite.x = x * tileSize;
    sprite.y = y * tileSize;

    tileContainer.addChild(sprite);
  }
}

container.x = 32;
container.y = 64;

app.stage.addChild(tileContainer);
app.stage.addChild(container);

let lastDT = Date.now();
const render = () => {
  const dt = Date.now() - lastDT;
  update(dt);
  app.render();
  lastDT = Date.now();
  window.requestAnimationFrame(render);
};

const update = (dt: number) => {
  container.y += 1;

  // const collisionDT = Engine.vectorSquareInterSection()
  console.log('update', dt);
};

window.requestAnimationFrame(render);