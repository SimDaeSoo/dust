import { Boundary, Dictionary, Line, MapData, Point } from "../interfaces/index";
import { lineIntersection } from "./Engine";

// TODO: Garbage Collection 최적화.
const EPSILON = 0.000001;

function getLightingPolygon(lightPoint: Point, map: MapData, length: number): Array<Point> {
  const vertices: Array<Point> = [];
  const lines: Array<Line> = [];
  const polygon: Array<Point> = [];
  const checkGrid: Dictionary<boolean> = {};
  const baseDictionary: Dictionary<boolean> = {};
  const duplicatedPoints: Dictionary<boolean> = {};
  const queue = [];
  const baseGridPositionX: number = Math.floor(lightPoint.x / map.tileSize);
  const baseGridPositionY: number = Math.floor(lightPoint.y / map.tileSize);
  const positionBoundaryMinX: number = Math.max(0, baseGridPositionX - length);
  const positionBoundaryMinY: number = Math.max(0, baseGridPositionY - length);
  const positionBoundaryMaxX: number = Math.min(map.width - 1, baseGridPositionX + length);
  const positionBoundaryMaxY: number = Math.min(map.height - 1, baseGridPositionY + length);
  const positions = [
    { x: baseGridPositionX, y: baseGridPositionY - 1 },
    { x: baseGridPositionX + 1, y: baseGridPositionY },
    { x: baseGridPositionX, y: baseGridPositionY + 1 },
    { x: baseGridPositionX - 1, y: baseGridPositionY }
  ];
  let position: Point;
  let isBlockedTile: boolean;
  let radian;

  checkGrid[`${baseGridPositionY},${baseGridPositionX}`] = true;

  for (const position of positions) {
    if (
      position.x >= positionBoundaryMinX &&
      position.x <= positionBoundaryMaxX &&
      position.y >= positionBoundaryMinY &&
      position.y <= positionBoundaryMaxY
    ) {
      checkGrid[`${position.y},${position.x}`] = true;
      queue.push(position);
    }
  }

  while (queue.length) {
    position = queue.splice(0, 1)[0];
    isBlockedTile = map.grid[position.y][position.x] && !map.grid[position.y][position.x].movable;

    if (isBlockedTile) {
      if (position.x > baseGridPositionX) {
        if (position.y > baseGridPositionY) { // RD
          if (!map.grid[position.y - 1][position.x - 1] || map.grid[position.y - 1][position.x - 1].movable) {
            vertices.push({ x: (position.x * map.tileSize), y: (position.y * map.tileSize) });
          }
          if (!map.grid[position.y][position.x - 1] || map.grid[position.y][position.x - 1].movable) {
            vertices.push({ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize });
            lines.push([{ x: (position.x * map.tileSize), y: (position.y * map.tileSize) }, { x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          }
          if (!map.grid[position.y - 1][position.x] || map.grid[position.y - 1][position.x].movable) {
            vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) });
            lines.push([{ x: (position.x * map.tileSize), y: (position.y * map.tileSize) }, { x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) }]);
          }
        } else if (position.y < baseGridPositionY) { // RU
          if (!map.grid[position.y + 1][position.x - 1] || map.grid[position.y + 1][position.x - 1].movable) {
            vertices.push({ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize });
          }
          if (!map.grid[position.y][position.x - 1] || map.grid[position.y][position.x - 1].movable) {
            vertices.push({ x: (position.x * map.tileSize), y: (position.y * map.tileSize) });
            lines.push([{ x: (position.x * map.tileSize), y: (position.y * map.tileSize) }, { x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          }
          if (!map.grid[position.y + 1][position.x] || map.grid[position.y + 1][position.x].movable) {
            vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize });
            lines.push([{ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize }, { x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          }
        } else if (!baseDictionary['R']) { // R
          vertices.push({ x: (position.x * map.tileSize), y: (position.y * map.tileSize) });
          vertices.push({ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize });
          lines.push([{ x: (position.x * map.tileSize), y: (position.y * map.tileSize) }, { x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          baseDictionary['R'] = true;
        }
      } else if (position.x < baseGridPositionX) {
        if (position.y > baseGridPositionY) { // LD

          if (!map.grid[position.y - 1][position.x + 1] || map.grid[position.y - 1][position.x + 1].movable) {
            vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) });
          }
          if (!map.grid[position.y][position.x + 1] || map.grid[position.y][position.x + 1].movable) {
            vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize });
            lines.push([{ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) }, { x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          }
          if (!map.grid[position.y - 1][position.x] || map.grid[position.y - 1][position.x].movable) {
            vertices.push({ x: (position.x * map.tileSize), y: (position.y * map.tileSize) });
            lines.push([{ x: (position.x * map.tileSize), y: (position.y * map.tileSize) }, { x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) }]);
          }
        } else if (position.y < baseGridPositionY) { // LU
          if (!map.grid[position.y + 1][position.x + 1] || map.grid[position.y + 1][position.x + 1].movable) {
            vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize });
          }
          if (!map.grid[position.y][position.x + 1] || map.grid[position.y][position.x + 1].movable) {
            vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) });
            lines.push([{ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) }, { x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          }
          if (!map.grid[position.y + 1][position.x] || map.grid[position.y + 1][position.x].movable) {
            vertices.push({ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize });
            lines.push([{ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize }, { x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          }
        } else if (!baseDictionary['L']) { // L
          vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) });
          vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize });
          lines.push([{ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) }, { x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          baseDictionary['L'] = true;
        }
      } else {
        if (position.y > baseGridPositionY && !baseDictionary['D']) { // D
          vertices.push({ x: (position.x * map.tileSize), y: (position.y * map.tileSize) });
          vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) });
          lines.push([{ x: (position.x * map.tileSize), y: (position.y * map.tileSize) }, { x: ((position.x + 1) * map.tileSize), y: (position.y * map.tileSize) }]);
          baseDictionary['D'] = true;
        } else if (position.y < baseGridPositionY && !baseDictionary['U']) { // U
          vertices.push({ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize });
          vertices.push({ x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize });
          lines.push([{ x: (position.x * map.tileSize), y: (position.y + 1) * map.tileSize }, { x: ((position.x + 1) * map.tileSize), y: (position.y + 1) * map.tileSize }]);
          baseDictionary['U'] = true;
        }
      }
    } else {
      const childPositions: Array<any> = [];

      if (position.x <= baseGridPositionX && !checkGrid[`${position.y},${position.x - 1}`]) childPositions.push({ x: position.x - 1, y: position.y });
      if (position.x >= baseGridPositionX && !checkGrid[`${position.y},${position.x + 1}`]) childPositions.push({ x: position.x + 1, y: position.y });
      if (position.y <= baseGridPositionY && !checkGrid[`${position.y - 1},${position.x}`]) childPositions.push({ x: position.x, y: position.y - 1 });
      if (position.y >= baseGridPositionY && !checkGrid[`${position.y + 1},${position.x}`]) childPositions.push({ x: position.x, y: position.y + 1 });

      for (const childPosition of childPositions) {
        if (
          childPosition.x >= positionBoundaryMinX &&
          childPosition.x <= positionBoundaryMaxX &&
          childPosition.y >= positionBoundaryMinY &&
          childPosition.y <= positionBoundaryMaxY
        ) {
          checkGrid[`${childPosition.y},${childPosition.x}`] = true;
          queue.push(childPosition);
        }
      }
    }
  }

  lines.push(
    [{ x: positionBoundaryMinX * map.tileSize, y: positionBoundaryMinY * map.tileSize }, { x: (positionBoundaryMaxX + 1) * map.tileSize, y: positionBoundaryMinY * map.tileSize }],
    [{ x: positionBoundaryMinX * map.tileSize, y: (positionBoundaryMaxY + 1) * map.tileSize }, { x: (positionBoundaryMaxX + 1) * map.tileSize, y: (positionBoundaryMaxY + 1) * map.tileSize }],
    [{ x: positionBoundaryMinX * map.tileSize, y: positionBoundaryMinY * map.tileSize }, { x: positionBoundaryMinX * map.tileSize, y: (positionBoundaryMaxY + 1) * map.tileSize }],
    [{ x: (positionBoundaryMaxX + 1) * map.tileSize, y: positionBoundaryMinY * map.tileSize }, { x: (positionBoundaryMaxX + 1) * map.tileSize, y: (positionBoundaryMaxY + 1) * map.tileSize }],
  );
  vertices.push(
    { x: positionBoundaryMinX * map.tileSize, y: positionBoundaryMinY * map.tileSize },
    { x: (positionBoundaryMaxX + 1) * map.tileSize, y: positionBoundaryMinY * map.tileSize },
    { x: positionBoundaryMinX * map.tileSize, y: (positionBoundaryMaxY + 1) * map.tileSize },
    { x: (positionBoundaryMaxX + 1) * map.tileSize, y: (positionBoundaryMaxY + 1) * map.tileSize }
  );
  for (const vertex of vertices) {
    radian = Math.atan2(vertex.y - lightPoint.y, vertex.x - lightPoint.x);
    const rays: Array<Line> = [
      [{ x: lightPoint.x, y: lightPoint.y }, { x: lightPoint.x + Math.cos(radian + EPSILON) * (2 * length * map.tileSize), y: lightPoint.y + Math.sin(radian + EPSILON) * (2 * length * map.tileSize) }],
      [{ x: lightPoint.x, y: lightPoint.y }, { x: lightPoint.x + Math.cos(radian - EPSILON) * (2 * length * map.tileSize), y: lightPoint.y + Math.sin(radian - EPSILON) * (2 * length * map.tileSize) }],
    ];

    for (const ray of rays) {
      for (const line of lines) {
        const dt = lineIntersection(ray, line);
        if (dt >= 0 && dt <= 1) {
          polygon.push({ x: ray[0].x + (ray[1].x - ray[0].x) * dt, y: ray[0].y + (ray[1].y - ray[0].y) * dt });
          break;
        }
      }
    }
  }

  polygon.sort((pointA, pointB) => Math.atan2(pointA.y - lightPoint.y, pointA.x - lightPoint.x) > Math.atan2(pointB.y - lightPoint.y, pointB.x - lightPoint.x) ? 1 : -1);

  return polygon.reduce((vertices: Array<Point>, point, index) => {
    const prevPoint = index === 0 ? polygon[polygon.length - 1] : polygon[index - 1];
    const nextPoint = index === polygon.length - 1 ? polygon[0] : polygon[index + 1];
    const sameX = Math.abs(prevPoint.x - point.x) <= EPSILON && Math.abs(nextPoint.x - point.x) <= EPSILON;
    const sameY = Math.abs(prevPoint.y - point.y) <= EPSILON && Math.abs(nextPoint.y - point.y) <= EPSILON;

    if (!sameX && !sameY && !duplicatedPoints[`${Math.round(point.y)},${Math.round(point.x)}`]) {
      vertices.push({ x: Math.round(point.x), y: Math.round(point.y) });
      duplicatedPoints[`${Math.round(point.y)},${Math.round(point.x)}`] = true;
    }

    return vertices;
  }, []);
}

export {
  getLightingPolygon
};