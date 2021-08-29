import { Boundary, Dictionary, Line, MapData, Point } from "../interfaces/index";
import { lineIntersection } from "./Engine";

function getLightingPolygon(lightPoint: Point, map: MapData, length: number, options?: { getTiles: boolean }): Array<Point> {
  const vertices: Array<Point> = [];
  const lines: Array<Line> = [];
  const polygon: Array<Point> = [];
  const checkGrid: Dictionary<boolean> = {};
  const baseDictionary: Dictionary<boolean> = {};
  const tiles: Array<Point> = [];
  const baseGridPosition: Point = {
    x: Math.floor(lightPoint.x / map.tileSize),
    y: Math.floor(lightPoint.y / map.tileSize)
  };
  const positionBoundary: Boundary<Point> = {
    min: {
      x: Math.max(0, baseGridPosition.x - length),
      y: Math.max(0, baseGridPosition.y - length)
    },
    max: {
      x: Math.min(map.width - 1, baseGridPosition.x + length),
      y: Math.min(map.height - 1, baseGridPosition.y + length)
    }
  };
  const queue = [];
  checkGrid[`${baseGridPosition.y},${baseGridPosition.x}`] = true;

  for (const position of [
    { x: baseGridPosition.x, y: baseGridPosition.y - 1 },
    { x: baseGridPosition.x + 1, y: baseGridPosition.y },
    { x: baseGridPosition.x, y: baseGridPosition.y + 1 },
    { x: baseGridPosition.x - 1, y: baseGridPosition.y }
  ]) {
    const vaildTile: boolean =
      position.x >= positionBoundary.min.x &&
      position.x <= positionBoundary.max.x &&
      position.y >= positionBoundary.min.y &&
      position.y <= positionBoundary.max.y;

    if (vaildTile) {
      checkGrid[`${position.y},${position.x}`] = true;
      queue.push(position);
    }
  }

  while (queue.length) {
    const position: Point = queue.splice(0, 1)[0];
    const isBlockedTile: boolean = map.grid[position.y][position.x] && !map.grid[position.y][position.x].movable;

    if (isBlockedTile) {
      const tilePositions: Array<Point> = [
        { x: position.x * map.tileSize, y: position.y * map.tileSize },
        { x: (position.x + 1) * map.tileSize, y: (position.y + 1) * map.tileSize }
      ];
      if (position.x > baseGridPosition.x) {
        if (position.y > baseGridPosition.y) { // RD
          if (!map.grid[position.y - 1][position.x - 1] || map.grid[position.y - 1][position.x - 1].movable) {
            vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          }
          if (!map.grid[position.y][position.x - 1] || map.grid[position.y][position.x - 1].movable) {
            vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
            lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[0].x, y: tilePositions[1].y }]);
          }
          if (!map.grid[position.y - 1][position.x] || map.grid[position.y - 1][position.x].movable) {
            vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
            lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[0].y }]);
          }
        } else if (position.y < baseGridPosition.y) { // RU
          if (!map.grid[position.y + 1][position.x - 1] || map.grid[position.y + 1][position.x - 1].movable) {
            vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          }
          if (!map.grid[position.y][position.x - 1] || map.grid[position.y][position.x - 1].movable) {
            vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
            lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[0].x, y: tilePositions[1].y }]);
          }
          if (!map.grid[position.y + 1][position.x] || map.grid[position.y + 1][position.x].movable) {
            vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
            lines.push([{ x: tilePositions[0].x, y: tilePositions[1].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          }
        } else if (!baseDictionary['R']) { // R
          vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[0].x, y: tilePositions[1].y }]);
          baseDictionary['R'] = true;
        }
      } else if (position.x < baseGridPosition.x) {
        if (position.y > baseGridPosition.y) { // LD

          if (!map.grid[position.y - 1][position.x + 1] || map.grid[position.y - 1][position.x + 1].movable) {
            vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          }
          if (!map.grid[position.y][position.x + 1] || map.grid[position.y][position.x + 1].movable) {
            vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
            lines.push([{ x: tilePositions[1].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          }
          if (!map.grid[position.y - 1][position.x] || map.grid[position.y - 1][position.x].movable) {
            vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
            lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[0].y }]);
          }
        } else if (position.y < baseGridPosition.y) { // LU
          if (!map.grid[position.y + 1][position.x + 1] || map.grid[position.y + 1][position.x + 1].movable) {
            vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          }
          if (!map.grid[position.y][position.x + 1] || map.grid[position.y][position.x + 1].movable) {
            vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
            lines.push([{ x: tilePositions[1].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          }
          if (!map.grid[position.y + 1][position.x] || map.grid[position.y + 1][position.x].movable) {
            vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
            lines.push([{ x: tilePositions[0].x, y: tilePositions[1].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          }
        } else if (!baseDictionary['L']) { // L
          vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[1].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          baseDictionary['L'] = true;
        }
      } else {
        if (position.y > baseGridPosition.y && !baseDictionary['D']) { // D
          vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[0].y }]);
          baseDictionary['D'] = true;
        } else if (position.y < baseGridPosition.y && !baseDictionary['U']) { // U
          vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[1].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          baseDictionary['U'] = true;
        }
      }
    } else {
      const childPositions: Array<any> = [];

      if (position.x <= baseGridPosition.x && !checkGrid[`${position.y},${position.x - 1}`]) childPositions.push({ x: position.x - 1, y: position.y });
      if (position.x >= baseGridPosition.x && !checkGrid[`${position.y},${position.x + 1}`]) childPositions.push({ x: position.x + 1, y: position.y });
      if (position.y <= baseGridPosition.y && !checkGrid[`${position.y - 1},${position.x}`]) childPositions.push({ x: position.x, y: position.y - 1 });
      if (position.y >= baseGridPosition.y && !checkGrid[`${position.y + 1},${position.x}`]) childPositions.push({ x: position.x, y: position.y + 1 });

      for (const childPosition of childPositions) {
        const vaildTile: boolean =
          childPosition.x >= positionBoundary.min.x &&
          childPosition.x <= positionBoundary.max.x &&
          childPosition.y >= positionBoundary.min.y &&
          childPosition.y <= positionBoundary.max.y;

        if (vaildTile) {
          tiles.push({ x: childPosition.x, y: childPosition.y });
          checkGrid[`${childPosition.y},${childPosition.x}`] = true;
          queue.push(childPosition);
        }
      }
    }
  }

  lines.push(
    [{ x: positionBoundary.min.x * map.tileSize, y: positionBoundary.min.y * map.tileSize }, { x: (positionBoundary.max.x + 1) * map.tileSize, y: positionBoundary.min.y * map.tileSize }],
    [{ x: positionBoundary.min.x * map.tileSize, y: (positionBoundary.max.y + 1) * map.tileSize }, { x: (positionBoundary.max.x + 1) * map.tileSize, y: (positionBoundary.max.y + 1) * map.tileSize }],
    [{ x: positionBoundary.min.x * map.tileSize, y: positionBoundary.min.y * map.tileSize }, { x: positionBoundary.min.x * map.tileSize, y: (positionBoundary.max.y + 1) * map.tileSize }],
    [{ x: (positionBoundary.max.x + 1) * map.tileSize, y: positionBoundary.min.y * map.tileSize }, { x: (positionBoundary.max.x + 1) * map.tileSize, y: (positionBoundary.max.y + 1) * map.tileSize }],
  );
  vertices.push(
    { x: positionBoundary.min.x * map.tileSize, y: positionBoundary.min.y * map.tileSize },
    { x: (positionBoundary.max.x + 1) * map.tileSize, y: positionBoundary.min.y * map.tileSize },
    { x: positionBoundary.min.x * map.tileSize, y: (positionBoundary.max.y + 1) * map.tileSize },
    { x: (positionBoundary.max.x + 1) * map.tileSize, y: (positionBoundary.max.y + 1) * map.tileSize }
  );

  const RAY_LENGTH = 2 * length * map.tileSize;
  const EPSILON = 0.000001;
  for (const vertex of vertices) {
    const radian = Math.atan2(vertex.y - lightPoint.y, vertex.x - lightPoint.x);
    const rays: Array<Line> = [
      [{ x: lightPoint.x, y: lightPoint.y }, { x: lightPoint.x + Math.cos(radian + EPSILON) * RAY_LENGTH, y: lightPoint.y + Math.sin(radian + EPSILON) * RAY_LENGTH }],
      [{ x: lightPoint.x, y: lightPoint.y }, { x: lightPoint.x + Math.cos(radian - EPSILON) * RAY_LENGTH, y: lightPoint.y + Math.sin(radian - EPSILON) * RAY_LENGTH }],
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

  if (options && options.getTiles) return tiles;
  return polygon.reduce((vertices: Array<Point>, point, index) => {
    const prevPoint = index === 0 ? polygon[polygon.length - 1] : polygon[index - 1];
    const nextPoint = index === polygon.length - 1 ? polygon[0] : polygon[index + 1];
    const sameX = Math.abs(prevPoint.x - point.x) <= EPSILON && Math.abs(nextPoint.x - point.x) <= EPSILON;
    const sameY = Math.abs(prevPoint.y - point.y) <= EPSILON && Math.abs(nextPoint.y - point.y) <= EPSILON;

    if (!sameX && !sameY) vertices.push({ x: Math.round(point.x), y: Math.round(point.y) });

    return vertices;
  }, []);
}

export {
  getLightingPolygon
};