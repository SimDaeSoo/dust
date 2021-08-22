import { vectorSquareInterSection } from '../core/engine';
import { Square, Vector } from '../types';

function main() {
  const vectorSquareA: { square: Square, vector: Vector } = {
    square: { x: 0, y: 0, w: 10, h: 10 },
    vector: { x: 10, y: 3 }
  };

  const vectorSquareB: { square: Square, vector: Vector } = {
    square: { x: 14, y: -2, w: 10, h: 10 },
    vector: { x: -1, y: 10 }
  };

  const dt: number = vectorSquareInterSection(vectorSquareA, vectorSquareB);

  vectorSquareA.square.x += vectorSquareA.vector.x * dt;
  vectorSquareA.square.y += vectorSquareA.vector.y * dt;
  vectorSquareB.square.x += vectorSquareB.vector.x * dt;
  vectorSquareB.square.y += vectorSquareB.vector.y * dt;

  console.log(dt);
  console.log(vectorSquareA);
  console.log(vectorSquareB);
}

main();