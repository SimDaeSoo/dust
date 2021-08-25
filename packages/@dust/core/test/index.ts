import { MapData, Square, Vector, CollisionDirectionLine, DIRECTION } from "../interfaces";
import { collision } from "../modules/Engine";
import { print, generate } from "../modules/Map";

function main(): void {
  const seed: string = 'seed';
  const width: number = 100;
  const height: number = 15;
  const tileSize: number = 16;
  const map: MapData = {
    seed,
    width,
    height,
    tileSize,
    grid: generate(width, height, seed)
  };
  const vectorSquare: { square: Square, vector: Vector } = {
    square: {
      x: 0,
      y: 0,
      w: 10,
      h: 40
    },
    vector: {
      x: 0.5,
      y: 0.5
    }
  };

  print(map);

  const collisionDatas: Array<CollisionDirectionLine> = collision(vectorSquare, map);
  const collisionDirection: { x: boolean, y: boolean } = { x: false, y: false };
  for (const collisionData of collisionDatas) {
    switch (collisionData.direction) {
      case DIRECTION.BOTTOM: {
        collisionDirection.y = true;
        vectorSquare.square.y = collisionData.line[0].y - vectorSquare.square.h;
        break;
      }
      case DIRECTION.TOP: {
        collisionDirection.y = true;
        vectorSquare.square.y = collisionData.line[0].y;
        break;
      }
      case DIRECTION.RIGHT: {
        collisionDirection.x = true;
        vectorSquare.square.x = collisionData.line[0].x - vectorSquare.square.w;
        break;
      }
      case DIRECTION.LEFT: {
        collisionDirection.x = true;
        vectorSquare.square.x = collisionData.line[0].x;
        break;
      }
    }
  }
  if (!collisionDirection.x) vectorSquare.square.x += vectorSquare.vector.x;
  if (!collisionDirection.y) vectorSquare.square.y += vectorSquare.vector.y;
  console.log(vectorSquare.square);
}

main();