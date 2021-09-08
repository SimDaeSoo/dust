import { Line, Boundary, Square, Vector, MapData, Point, Dictionary, CollisionDirectionLine, DIRECTION } from '../interfaces';

// TODO: Garbage Collection 최적화.
function collision(vectorSquare: { square: Square, vector: Vector }, map: MapData): Array<CollisionDirectionLine> {
  return getCollisionsVectorSquareDirectionLines(vectorSquare, getDirectionLinesOnVectorSquare(vectorSquare, map));
}

function filteringRealCollisionDirectionLines(collisionDirectionLines: Array<CollisionDirectionLine>): Array<CollisionDirectionLine> {
  if (!collisionDirectionLines.length) return [];

  collisionDirectionLines.sort((collisionLineA: CollisionDirectionLine, collisionLineB: CollisionDirectionLine): number => {
    if (collisionLineA.dt > collisionLineB.dt) {
      return 1;
    } else if (collisionLineA.dt < collisionLineB.dt) {
      return -1;
    } else if (collisionLineA.duplicated && !collisionLineB.duplicated) {
      return -1;
    } else if (!collisionLineA.duplicated && collisionLineB.duplicated) {
      return 1;
    } else {
      return 0;
    }
  });

  const firstCollisionDirectionLine: CollisionDirectionLine = collisionDirectionLines[0];
  const collisionDirection: DIRECTION = firstCollisionDirectionLine.direction;

  switch (collisionDirection) {
    case DIRECTION.LEFT: {
      for (let i = collisionDirectionLines.length - 1; i > 0; i--) {
        const collisionDirectionLine: CollisionDirectionLine = collisionDirectionLines[i];
        if (collisionDirectionLine.line[1].x <= firstCollisionDirectionLine.line[0].x) {
          collisionDirectionLines.splice(i, 1);
        }
      }
      break;
    }
    case DIRECTION.RIGHT: {
      for (let i = collisionDirectionLines.length - 1; i > 0; i--) {
        const collisionDirectionLine: CollisionDirectionLine = collisionDirectionLines[i];
        if (collisionDirectionLine.line[0].x >= firstCollisionDirectionLine.line[0].x) {
          collisionDirectionLines.splice(i, 1);
        }
      }
      break;
    }
    case DIRECTION.TOP: {
      for (let i = collisionDirectionLines.length - 1; i > 0; i--) {
        const collisionDirectionLine: CollisionDirectionLine = collisionDirectionLines[i];
        if (collisionDirectionLine.line[1].y <= firstCollisionDirectionLine.line[0].y) {
          collisionDirectionLines.splice(i, 1);
        }
      }
      break;
    }
    case DIRECTION.BOTTOM: {
      for (let i = collisionDirectionLines.length - 1; i > 0; i--) {
        const collisionDirectionLine: CollisionDirectionLine = collisionDirectionLines[i];
        if (collisionDirectionLine.line[0].y >= firstCollisionDirectionLine.line[0].y) {
          collisionDirectionLines.splice(i, 1);
        }
      }
    }
  }

  return collisionDirectionLines;
}

function getCollisionsVectorSquareDirectionLines(vectorSquare: { square: Square, vector: Vector }, directionLines: Dictionary<Array<Line>>): Array<CollisionDirectionLine> {
  const collisionDirectionLines: Dictionary<CollisionDirectionLine> = {}

  if (vectorSquare.vector.x > 0) {
    for (const line of directionLines[DIRECTION.LEFT]) {
      const dt: number = vectorSquareInterSection({
        square: {
          x: vectorSquare.square.x + vectorSquare.square.w,
          y: vectorSquare.square.y,
          w: 0,
          h: vectorSquare.square.h
        },
        vector: vectorSquare.vector
      }, {
        square: {
          x: line[0].x,
          y: line[0].y,
          w: 0,
          h: line[1].y - line[0].y
        },
        vector: { x: 0, y: 0 }
      });
      if (dt >= 0 && dt <= 1 && (!collisionDirectionLines[DIRECTION.RIGHT] || collisionDirectionLines[DIRECTION.RIGHT].dt >= dt)) {
        collisionDirectionLines[DIRECTION.RIGHT] = { direction: DIRECTION.RIGHT, dt, line, duplicated: collisionDirectionLines[DIRECTION.RIGHT]?.dt === dt };
      }
    }
  }

  if (vectorSquare.vector.x < 0) {
    for (const line of directionLines[DIRECTION.RIGHT]) {
      const dt: number = vectorSquareInterSection({
        square: {
          x: vectorSquare.square.x,
          y: vectorSquare.square.y,
          w: 0,
          h: vectorSquare.square.h
        },
        vector: vectorSquare.vector
      }, {
        square: {
          x: line[0].x,
          y: line[0].y,
          w: 0,
          h: line[1].y - line[0].y
        },
        vector: { x: 0, y: 0 }
      });
      if (dt >= 0 && dt <= 1 && (!collisionDirectionLines[DIRECTION.LEFT] || collisionDirectionLines[DIRECTION.LEFT].dt >= dt)) {
        collisionDirectionLines[DIRECTION.LEFT] = { direction: DIRECTION.LEFT, dt, line, duplicated: collisionDirectionLines[DIRECTION.LEFT]?.dt === dt };
      }
    }
  }

  if (vectorSquare.vector.y > 0) {
    for (const line of directionLines[DIRECTION.TOP]) {
      const dt: number = vectorSquareInterSection({
        square: {
          x: vectorSquare.square.x,
          y: vectorSquare.square.y + vectorSquare.square.h,
          w: vectorSquare.square.w,
          h: 0
        },
        vector: vectorSquare.vector
      }, {
        square: {
          x: line[0].x,
          y: line[0].y,
          w: line[1].x - line[0].x,
          h: 0
        },
        vector: { x: 0, y: 0 }
      });
      if (dt >= 0 && dt <= 1 && (!collisionDirectionLines[DIRECTION.BOTTOM] || collisionDirectionLines[DIRECTION.BOTTOM].dt >= dt)) {
        collisionDirectionLines[DIRECTION.BOTTOM] = { direction: DIRECTION.BOTTOM, dt, line, duplicated: collisionDirectionLines[DIRECTION.BOTTOM]?.dt === dt };
      }
    }
  }

  if (vectorSquare.vector.y < 0) {
    for (const line of directionLines[DIRECTION.BOTTOM]) {
      const dt: number = vectorSquareInterSection({
        square: {
          x: vectorSquare.square.x,
          y: vectorSquare.square.y,
          w: vectorSquare.square.w,
          h: 0
        },
        vector: vectorSquare.vector
      }, {
        square: {
          x: line[0].x,
          y: line[0].y,
          w: line[1].x - line[0].x,
          h: 0
        },
        vector: { x: 0, y: 0 }
      });
      if (dt >= 0 && dt <= 1 && (!collisionDirectionLines[DIRECTION.TOP] || collisionDirectionLines[DIRECTION.TOP].dt >= dt)) {
        collisionDirectionLines[DIRECTION.TOP] = { direction: DIRECTION.TOP, dt, line, duplicated: collisionDirectionLines[DIRECTION.TOP]?.dt === dt };
      }
    }
  }

  return filteringRealCollisionDirectionLines([collisionDirectionLines[DIRECTION.TOP], collisionDirectionLines[DIRECTION.BOTTOM], collisionDirectionLines[DIRECTION.LEFT], collisionDirectionLines[DIRECTION.RIGHT]]);
}

function getDirectionLinesOnVectorSquare(vectorSquare: { square: Square, vector: Vector }, map: MapData): Dictionary<Array<Line>> {
  const lines: Dictionary<Array<Line>> = {
    [DIRECTION.LEFT]: [[{ x: map.width * map.tileSize, y: 0 }, { x: map.width * map.tileSize, y: map.height * map.tileSize }]],
    [DIRECTION.RIGHT]: [[{ x: 0, y: 0 }, { x: 0, y: map.height * map.tileSize }]],
    [DIRECTION.TOP]: [[{ x: 0, y: map.height * map.tileSize }, { x: map.width * map.tileSize, y: map.height * map.tileSize }]],
    [DIRECTION.BOTTOM]: [[{ x: 0, y: 0 }, { x: map.width * map.tileSize, y: 0 }]]
  };
  const boundary: Boundary<Point> = {
    min: {
      x: Math.floor(
        Math.min(
          vectorSquare.square.x,
          vectorSquare.square.x + vectorSquare.vector.x,
          vectorSquare.square.x + vectorSquare.square.w,
          vectorSquare.square.x + vectorSquare.square.w + vectorSquare.vector.x,
        ) / map.tileSize
      ),
      y: Math.floor(
        Math.min(
          vectorSquare.square.y,
          vectorSquare.square.y + vectorSquare.vector.y,
          vectorSquare.square.y + vectorSquare.square.h,
          vectorSquare.square.y + vectorSquare.square.h + vectorSquare.vector.y,
        ) / map.tileSize
      ),
    },
    max: {
      x: Math.floor(
        Math.max(
          vectorSquare.square.x,
          vectorSquare.square.x + vectorSquare.vector.x,
          vectorSquare.square.x + vectorSquare.square.w,
          vectorSquare.square.x + vectorSquare.square.w + vectorSquare.vector.x,
        ) / map.tileSize
      ),
      y: Math.floor(
        Math.max(
          vectorSquare.square.y,
          vectorSquare.square.y + vectorSquare.vector.y,
          vectorSquare.square.y + vectorSquare.square.h,
          vectorSquare.square.y + vectorSquare.square.h + vectorSquare.vector.y,
        ) / map.tileSize
      ),
    }
  };

  boundary.min.x = boundary.min.x > 0 ? boundary.min.x : 0;
  boundary.min.y = boundary.min.y > 0 ? boundary.min.y : 0;
  boundary.max.x = boundary.max.x < map.width ? boundary.max.x : map.width - 1;
  boundary.max.y = boundary.max.y < map.height ? boundary.max.y : map.height - 1;

  for (let y = boundary.min.y; y <= boundary.max.y; y++) {
    for (let x = boundary.min.x; x <= boundary.max.x; x++) {
      if (!map.grid[y][x] || map.grid[y][x].movable) continue;

      if (x === 0 || (!map.grid[y][x - 1] || map.grid[y][x - 1].movable)) lines[DIRECTION.LEFT].push([{ x: x * map.tileSize, y: y * map.tileSize }, { x: x * map.tileSize, y: (y + 1) * map.tileSize }]);
      if (x === map.width - 1 || (!map.grid[y][x + 1] || map.grid[y][x + 1].movable)) lines[DIRECTION.RIGHT].push([{ x: (x + 1) * map.tileSize, y: y * map.tileSize }, { x: (x + 1) * map.tileSize, y: (y + 1) * map.tileSize }]);
      if (y === 0 || (!map.grid[y - 1][x] || map.grid[y - 1][x].movable)) lines[DIRECTION.TOP].push([{ x: x * map.tileSize, y: y * map.tileSize }, { x: (x + 1) * map.tileSize, y: y * map.tileSize }]);
      if (y === map.height - 1 || (!map.grid[y + 1][x] || map.grid[y + 1][x].movable)) lines[DIRECTION.BOTTOM].push([{ x: x * map.tileSize, y: (y + 1) * map.tileSize }, { x: (x + 1) * map.tileSize, y: (y + 1) * map.tileSize }]);
    }
  }

  return lines;
}

function lineIntersection(lineA: Line, lineB: Line): number {
  const det = (lineA[1].x - lineA[0].x) * (lineB[1].y - lineB[0].y) - (lineB[1].x - lineB[0].x) * (lineA[1].y - lineA[0].y);

  if (det === 0) {
    return -1;
  } else {
    const t1 = ((lineB[1].y - lineB[0].y) * (lineB[1].x - lineA[0].x) + (lineB[0].x - lineB[1].x) * (lineB[1].y - lineA[0].y)) / det;
    const t2 = ((lineA[0].y - lineA[1].y) * (lineB[1].x - lineA[0].x) + (lineA[1].x - lineA[0].x) * (lineB[1].y - lineA[0].y)) / det;

    return (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) ? t1 : -1;
  }
}

function vectorSquareInterSection(vectorSquareA: { square: Square, vector: Vector }, vectorSquareB: { square: Square, vector: Vector }): number {
  const xAxis: Boundary<number> = vectorSquareXAxisInterSection(vectorSquareA, vectorSquareB);
  const yAxis: Boundary<number> = vectorSquareYAxisInterSection(vectorSquareA, vectorSquareB);
  const hasXAxisIntersect: boolean = xAxis.min <= 1 && xAxis.max >= 0;
  const hasYAxisIntersect: boolean = yAxis.min <= 1 && yAxis.max >= 0;
  const hasIntersect: boolean = hasXAxisIntersect && hasYAxisIntersect && yAxis.max >= xAxis.min && xAxis.max >= yAxis.min;

  if (hasIntersect) {
    return Math.max(xAxis.min, yAxis.min, 0);
  } else {
    return -1;
  }
}

function vectorSquareYAxisInterSection(vectorSquareA: { square: Square, vector: Vector }, vectorSquareB: { square: Square, vector: Vector }): Boundary<number> {
  const vectorDifference: number = vectorSquareB.vector.y - vectorSquareA.vector.y;
  const yAxisDifferenceA: number = vectorSquareA.square.y - (vectorSquareB.square.y + vectorSquareB.square.h);
  const yAxisDifferenceB: number = (vectorSquareA.square.y + vectorSquareA.square.h) - vectorSquareB.square.y;
  const t1: number = yAxisDifferenceA / vectorDifference;
  const t2: number = yAxisDifferenceB / vectorDifference;

  if (vectorDifference === 0 && yAxisDifferenceB >= 0 && yAxisDifferenceA <= 0) {
    return { min: -Infinity, max: Infinity };
  } else if (vectorDifference > 0) {
    return { min: t1, max: t2 };
  } else if (vectorDifference < 0) {
    return { min: t2, max: t1 };
  } else {
    return { min: Infinity, max: -Infinity };
  }
}

function vectorSquareXAxisInterSection(vectorSquareA: { square: Square, vector: Vector }, vectorSquareB: { square: Square, vector: Vector }): Boundary<number> {
  const vectorDifference: number = vectorSquareB.vector.x - vectorSquareA.vector.x;
  const xAxisDifferenceA: number = vectorSquareA.square.x - (vectorSquareB.square.x + vectorSquareB.square.w);
  const xAxisDifferenceB: number = (vectorSquareA.square.x + vectorSquareA.square.w) - vectorSquareB.square.x;
  const t1: number = xAxisDifferenceA / vectorDifference;
  const t2: number = xAxisDifferenceB / vectorDifference;

  if (vectorDifference === 0 && xAxisDifferenceB >= 0 && xAxisDifferenceA <= 0) {
    return { min: -Infinity, max: Infinity };
  } else if (vectorDifference > 0) {
    return { min: t1, max: t2 };
  } else if (vectorDifference < 0) {
    return { min: t2, max: t1 };
  } else {
    return { min: Infinity, max: -Infinity };
  }
}

export {
  filteringRealCollisionDirectionLines,
  getCollisionsVectorSquareDirectionLines,
  getDirectionLinesOnVectorSquare,
  lineIntersection,
  vectorSquareInterSection,
  collision
};