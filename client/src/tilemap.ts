import * as PIXI from 'pixi.js';
import { MapData, Point, Square } from '@dust/core';
import { TILEMAP_DATA } from './constants';

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

        tileSprite.width = map.tileSize;
        tileSprite.height = map.tileSize;
        tileSprite.x = (x - this.margin) * map.tileSize;
        tileSprite.y = (y - this.margin) * map.tileSize;

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
    }

    for (let y = 0; y <= Math.round(this.viewport.h / this.map.tileSize) + 2 * this.margin; y++) {
      for (let x = 0; x <= Math.round(this.viewport.w / this.map.tileSize) + 2 * this.margin; x++) {
        const position: Point = { x: this.prevGridPosition.x + x - this.margin, y: this.prevGridPosition.y + y - this.margin };
        this.tiles[y][x].alpha = 1;

        if (position.x >= 0 && position.x <= this.map.width - 1 && position.y >= 0 && position.y <= this.map.height - 1) {
          if (this.map.grid[position.y][position.x].movable) {
            if (this.map.grid[position.y][position.x].liquid) {
              const waterLevel = Math.floor(33 - Math.min(this.map.grid[position.y][position.x].liquid, 1) * 33);
              const tileNumber = waterLevel.toString().padStart(2, '0');
              this.tiles[y][x].alpha = Math.min(0.4 + this.map.grid[position.y][position.x].liquid * 0.15, 0.8);

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
                  this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/water/36.png`);
                } else if (this.map.grid[position.y - 1][position.x - 1].liquid) {
                  this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/water/35.png`);
                } else if (this.map.grid[position.y - 1][position.x + 1].liquid) {
                  this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/water/34.png`);
                }
              } else if (waterLevel <= 1 && (position.y === 0 || (this.map.grid[position.y - 1][position.x].movable && !this.map.grid[position.y - 1][position.x].liquid))) {
                this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/water/02.png`);
              } else if (position.y > 0 && this.map.grid[position.y - 1][position.x].liquid) {
                this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/water/00.png`);
              } else {
                this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/water/${tileNumber}.png`);
              }
            } else {
              this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/mine/Tile_10.png`); // TEST
              // this.tiles[y][x].texture = PIXI.Texture.EMPTY;
            }
          } else {
            this.tiles[y][x].texture = PIXI.Texture.from(`../static/assets/tiles/${TILEMAP_DATA[this.map.grid[position.y][position.x].tileType - 1]}/Tile_${this.map.grid[position.y][position.x].tileNumber.toString().padStart(2, '0')}.png`);
          }
        } else {
          this.tiles[y][x].texture = PIXI.Texture.EMPTY;
        }
      }
    }
  }
}

export default Tilemap;