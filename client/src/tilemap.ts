import * as PIXI from 'pixi.js';
import { MapData, Point, Square } from '@dust/core';
import { TILEMAP_DATA } from './constants';

class Tilemap {
  public container: PIXI.Container;
  private liquidContainer: PIXI.Container;
  private foregroundContainer: PIXI.Container;
  private backgroundContainer: PIXI.Container;
  private margin: number;
  private tiles: Array<Array<{ foreground: PIXI.Sprite, background: PIXI.Sprite, liquid: PIXI.Sprite }>>;
  private prevGridPosition: Point;
  private map: MapData;
  private viewport: Square;

  constructor(map: MapData, viewport: Square, options?: { margin?: number }) {
    this.map = map;
    this.viewport = viewport;
    this.margin = options?.margin || 1;
    this.container = new PIXI.Container();
    this.liquidContainer = new PIXI.Container();
    this.foregroundContainer = new PIXI.Container();
    this.backgroundContainer = new PIXI.Container();
    this.prevGridPosition = { x: Math.ceil(viewport.x / map.tileSize), y: Math.ceil(viewport.y / map.tileSize) };
    this.container.x = this.prevGridPosition.x * map.tileSize;
    this.container.y = this.prevGridPosition.y * map.tileSize;
    this.tiles = [];

    for (let y = 0; y <= Math.round(viewport.h / map.tileSize) + 2 * this.margin; y++) {
      this.tiles.push([]);
      for (let x = 0; x <= Math.round(viewport.w / map.tileSize) + 2 * this.margin; x++) {
        const foregroundSprite = new PIXI.Sprite();
        foregroundSprite.width = map.tileSize;
        foregroundSprite.height = map.tileSize;
        foregroundSprite.x = (x - this.margin) * map.tileSize;
        foregroundSprite.y = (y - this.margin) * map.tileSize;

        const backgroundSprite = new PIXI.Sprite();
        backgroundSprite.width = map.tileSize;
        backgroundSprite.height = map.tileSize;
        backgroundSprite.x = (x - this.margin) * map.tileSize;
        backgroundSprite.y = (y - this.margin) * map.tileSize;

        const liquidSprite = new PIXI.Sprite();
        liquidSprite.width = map.tileSize;
        liquidSprite.height = map.tileSize;
        liquidSprite.x = (x - this.margin) * map.tileSize;
        liquidSprite.y = (y - this.margin) * map.tileSize;

        this.tiles[y].push({
          foreground: foregroundSprite,
          background: backgroundSprite,
          liquid: liquidSprite
        });

        this.backgroundContainer.addChild(backgroundSprite);
        this.foregroundContainer.addChild(foregroundSprite);
        this.liquidContainer.addChild(liquidSprite);
      }
    }

    this.container.addChild(this.backgroundContainer);
    this.container.addChild(this.foregroundContainer);
    this.container.addChild(this.liquidContainer); // 추후 따로 빼서 사용.

    for (let y = 0; y <= Math.round(this.viewport.h / this.map.tileSize) + 2 * this.margin; y++) {
      for (let x = 0; x <= Math.round(this.viewport.w / this.map.tileSize) + 2 * this.margin; x++) {
        this.updateBackground(x, y);
        this.updateForeground(x, y);
      }
    }
  }

  public update(): void {
    const nextGridPosition: Point = { x: Math.floor(this.viewport.x / this.map.tileSize), y: Math.floor(this.viewport.y / this.map.tileSize) };

    if (Math.abs(nextGridPosition.x - this.prevGridPosition.x) > this.margin || Math.abs(nextGridPosition.y - this.prevGridPosition.y) > this.margin) {
      this.prevGridPosition.x = nextGridPosition.x;
      this.prevGridPosition.y = nextGridPosition.y;
      this.container.x = this.prevGridPosition.x * this.map.tileSize;
      this.container.y = this.prevGridPosition.y * this.map.tileSize;

      for (let y = 0; y <= Math.round(this.viewport.h / this.map.tileSize) + 2 * this.margin; y++) {
        for (let x = 0; x <= Math.round(this.viewport.w / this.map.tileSize) + 2 * this.margin; x++) {
          this.updateBackground(x, y);
          this.updateForeground(x, y);
        }
      }
    }

    for (let y = 0; y <= Math.round(this.viewport.h / this.map.tileSize) + 2 * this.margin; y++) {
      for (let x = 0; x <= Math.round(this.viewport.w / this.map.tileSize) + 2 * this.margin; x++) {
        this.updateLiquid(x, y);
      }
    }
  }

  // TODO: Background Type, Number, Z-Indexing 어떻게 처릴할지? Foreground, Background, Liquid
  private updateLiquid(x: number, y: number): void {
    const position: Point = { x: this.prevGridPosition.x + x - this.margin, y: this.prevGridPosition.y + y - this.margin };

    if (position.x >= 0 && position.x <= this.map.width - 1 && position.y >= 0 && position.y <= this.map.height - 1) {
      if (this.map.grid[position.y][position.x].liquid) {
        const waterLevel = Math.floor(33 - Math.min(this.map.grid[position.y][position.x].liquid, 1) * 33);
        const tileNumber = waterLevel.toString().padStart(2, '0');
        this.tiles[y][x].liquid.alpha = Math.min(0.4 + this.map.grid[position.y][position.x].liquid * 0.15, 0.8);

        if (
          position.y < this.map.height - 1 &&
          position.y > 0 &&
          position.x < this.map.width - 1 &&
          position.x > 0 &&
          !this.map.grid[position.y - 1][position.x].liquid &&
          this.map.grid[position.y + 1][position.x].liquid &&
          (
            (
              this.map.grid[position.y][position.x - 1].liquid &&
              this.map.grid[position.y - 1][position.x - 1].liquid &&
              this.map.grid[position.y][position.x - 1].liquid < 1 &&
              this.map.grid[position.y - 1][position.x - 1].liquid < 1 &&
              this.map.grid[position.y + 1][position.x + 1].liquid < 1
            )
            ||
            (
              this.map.grid[position.y][position.x + 1].liquid &&
              this.map.grid[position.y - 1][position.x + 1].liquid &&
              this.map.grid[position.y][position.x + 1].liquid < 1 &&
              this.map.grid[position.y - 1][position.x + 1].liquid < 1 &&
              this.map.grid[position.y + 1][position.x - 1].liquid < 1
            )
          )
        ) {
          if (this.map.grid[position.y - 1][position.x - 1].liquid && this.map.grid[position.y - 1][position.x + 1].liquid) {
            this.tiles[y][x].liquid.texture = PIXI.Texture.from(`../static/assets/tiles/water/36.png`);
          } else if (this.map.grid[position.y - 1][position.x - 1].liquid) {
            this.tiles[y][x].liquid.texture = PIXI.Texture.from(`../static/assets/tiles/water/35.png`);
          } else if (this.map.grid[position.y - 1][position.x + 1].liquid) {
            this.tiles[y][x].liquid.texture = PIXI.Texture.from(`../static/assets/tiles/water/34.png`);
          }
        } else if (waterLevel <= 1 && (position.y === 0 || (this.map.grid[position.y - 1][position.x].movable && !this.map.grid[position.y - 1][position.x].liquid))) {
          this.tiles[y][x].liquid.texture = PIXI.Texture.from(`../static/assets/tiles/water/02.png`);
        } else if (position.y > 0 && this.map.grid[position.y - 1][position.x].liquid) {
          this.tiles[y][x].liquid.texture = PIXI.Texture.from(`../static/assets/tiles/water/00.png`);
        } else {
          this.tiles[y][x].liquid.texture = PIXI.Texture.from(`../static/assets/tiles/water/${tileNumber}.png`);
        }
      } else {
        this.tiles[y][x].liquid.texture = PIXI.Texture.EMPTY;
      }
    }
  }

  private updateBackground(x: number, y: number): void {
    const position: Point = { x: this.prevGridPosition.x + x - this.margin, y: this.prevGridPosition.y + y - this.margin };

    if (position.x >= 0 && position.x <= this.map.width - 1 && position.y >= 0 && position.y <= this.map.height - 1) {
      if (this.map.grid[position.y][position.x].movable) {
        this.tiles[y][x].background.texture = PIXI.Texture.from(`../static/assets/tiles/mine/Tile_10.png`);
      } else {
        this.tiles[y][x].background.texture = PIXI.Texture.EMPTY;
      }
    }
  }

  private updateForeground(x: number, y: number): void {
    const position: Point = { x: this.prevGridPosition.x + x - this.margin, y: this.prevGridPosition.y + y - this.margin };

    if (position.x >= 0 && position.x <= this.map.width - 1 && position.y >= 0 && position.y <= this.map.height - 1) {
      if (!this.map.grid[position.y][position.x].movable && this.map.grid[position.y][position.x].tileType !== 0) {
        this.tiles[y][x].foreground.texture = PIXI.Texture.from(`../static/assets/tiles/${TILEMAP_DATA[this.map.grid[position.y][position.x].tileType - 1]}/Tile_${this.map.grid[position.y][position.x].tileNumber.toString().padStart(2, '0')}.png`);
      } else {
        this.tiles[y][x].foreground.texture = PIXI.Texture.EMPTY;
      }
    } else {
      this.tiles[y][x].foreground.texture = PIXI.Texture.EMPTY;
    }
  }
}

export default Tilemap;