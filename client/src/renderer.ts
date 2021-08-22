import * as PIXI from 'pixi.js';
import '../static/index.css';

const resolution = window.devicePixelRatio || 1;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
// PIXI.settings.STRICT_TEXTURE_CACHE = true;

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x000000,
  sharedLoader: true,
  powerPreference: 'high-performance',
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
  animatedSprite.width = 128;
  animatedSprite.height = 128;
  animatedSprite.animationSpeed = 0.2;
  animatedSprite.play();

  container.addChild(animatedSprite);
});

app.stage.addChild(container);