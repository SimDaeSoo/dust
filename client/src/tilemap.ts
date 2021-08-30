import * as PIXI from 'pixi.js';
import { MapData, Point, Square } from '@dust/core';

class Tilemap {
  public container: PIXI.Container;
  private margin: number;
  private tiles: Array<Array<PIXI.Sprite>>;
  private prevGridPosition: Point;
  private map: MapData;
  private viewport: Square;

  constructor(map: MapData, viewport: Square, options?: { margin?: number }) {
    this.map = map;
    this.viewport = viewport;
    this.margin = options?.margin || 1;
    this.container = new PIXI.Container();
    this.prevGridPosition = { x: Math.ceil(viewport.x / map.tileSize), y: Math.ceil(viewport.y / map.tileSize) };
    this.container.x = this.prevGridPosition.x * map.tileSize;
    this.container.y = this.prevGridPosition.y * map.tileSize;
    this.tiles = [];

    for (let y = 0; y <= Math.round(viewport.h / map.tileSize) + 2 * this.margin; y++) {
      this.tiles.push([]);
      for (let x = 0; x <= Math.round(viewport.w / map.tileSize) + 2 * this.margin; x++) {
        const tileSprite = new PIXI.Sprite();
        const position: Point = { x: this.prevGridPosition.x + x - this.margin, y: this.prevGridPosition.y + y - this.margin };

        if (position.x >= 0 && position.x <= this.map.width - 1 && position.y >= 0 && position.y <= this.map.height - 1) {
          if (!this.map.grid[position.y][position.x] || this.map.grid[position.y][position.x].movable) {
            tileSprite.texture = PIXI.Texture.EMPTY;
          } else {
            tileSprite.texture = PIXI.Texture.WHITE;
          }
        } else {
          tileSprite.texture = PIXI.Texture.EMPTY;
        }

        tileSprite.width = map.tileSize;
        tileSprite.height = map.tileSize;
        tileSprite.x = (x - this.margin) * map.tileSize;
        tileSprite.y = (y - this.margin) * map.tileSize

        this.tiles[y].push(tileSprite);
        this.container.addChild(tileSprite);
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
          const position: Point = { x: this.prevGridPosition.x + x - this.margin, y: this.prevGridPosition.y + y - this.margin };

          if (position.x >= 0 && position.x <= this.map.width - 1 && position.y >= 0 && position.y <= this.map.height - 1) {
            if (!this.map.grid[position.y][position.x] || this.map.grid[position.y][position.x].movable) {
              this.tiles[y][x].texture = PIXI.Texture.EMPTY;
            } else {
              this.tiles[y][x].texture = PIXI.Texture.WHITE;
            }
          } else {
            this.tiles[y][x].texture = PIXI.Texture.EMPTY;
          }
        }
      }
    }
  }
}

export default Tilemap;