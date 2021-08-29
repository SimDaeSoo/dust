import { Boundary, Dictionary, Line, MapData, Point } from "../interfaces/index";
import { lineIntersection } from "./Engine";

function getLightingPolygon(lightPoint: Point, map: MapData, length: number): Array<Point> {
  const vertices: Array<Point> = [];
  const lines: Array<Line> = [];
  const polygon: Array<Point> = [];
  const checkGrid: Dictionary<boolean> = {};
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
    { x: baseGridPosition.x - 1, y: baseGridPosition.y },
    { x: baseGridPosition.x - 1, y: baseGridPosition.y - 1 },
    { x: baseGridPosition.x - 1, y: baseGridPosition.y + 1 },
    { x: baseGridPosition.x + 1, y: baseGridPosition.y - 1 },
    { x: baseGridPosition.x + 1, y: baseGridPosition.y + 1 },
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
        if (position.y > baseGridPosition.y) {
          vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[0].y }]);
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[0].x, y: tilePositions[1].y }]);
        } else if (position.y < baseGridPosition.y) {
          vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[1].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[0].x, y: tilePositions[1].y }]);
        } else {
          vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[0].x, y: tilePositions[1].y }]);
        }
      } else if (position.x < baseGridPosition.x) {
        if (position.y > baseGridPosition.y) {
          vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[0].y }]);
          lines.push([{ x: tilePositions[1].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
        } else if (position.y < baseGridPosition.y) {
          vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[1].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
          lines.push([{ x: tilePositions[0].x, y: tilePositions[1].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
        } else {
          vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[1].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
        }
      } else {
        if (position.y > baseGridPosition.y) {
          vertices.push({ x: tilePositions[0].x, y: tilePositions[0].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[0].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[0].y }, { x: tilePositions[1].x, y: tilePositions[0].y }]);
        } else if (position.y < baseGridPosition.y) {
          vertices.push({ x: tilePositions[0].x, y: tilePositions[1].y });
          vertices.push({ x: tilePositions[1].x, y: tilePositions[1].y });
          lines.push([{ x: tilePositions[0].x, y: tilePositions[1].y }, { x: tilePositions[1].x, y: tilePositions[1].y }]);
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
          checkGrid[`${childPosition.y},${childPosition.x}`] = true;
          queue.push(childPosition);
        }
      }
    }
  }

  lines.push(
    [{ x: positionBoundary.min.x * map.tileSize, y: positionBoundary.min.y * map.tileSize }, { x: positionBoundary.max.x * map.tileSize, y: positionBoundary.min.y * map.tileSize }],
    [{ x: positionBoundary.min.x * map.tileSize, y: positionBoundary.max.y * map.tileSize }, { x: positionBoundary.max.x * map.tileSize, y: positionBoundary.max.y * map.tileSize }],
    [{ x: positionBoundary.min.x * map.tileSize, y: positionBoundary.min.y * map.tileSize }, { x: positionBoundary.min.x * map.tileSize, y: positionBoundary.max.y * map.tileSize }],
    [{ x: positionBoundary.max.x * map.tileSize, y: positionBoundary.min.y * map.tileSize }, { x: positionBoundary.max.x * map.tileSize, y: positionBoundary.max.y * map.tileSize }],
  );
  vertices.push(
    { x: positionBoundary.min.x * map.tileSize, y: positionBoundary.min.y * map.tileSize },
    { x: positionBoundary.max.x * map.tileSize, y: positionBoundary.min.y * map.tileSize },
    { x: positionBoundary.min.x * map.tileSize, y: positionBoundary.max.y * map.tileSize },
    { x: positionBoundary.max.x * map.tileSize, y: positionBoundary.max.y * map.tileSize }
  );

  const RAY_LENGTH = 2 * length * map.tileSize;
  const EPSILON = 0.1;
  const RAY_EPSILON = 0.01 * Math.PI / 180;
  for (const vertex of vertices) {
    const radian = Math.atan2(vertex.y - lightPoint.y, vertex.x - lightPoint.x);
    const rays: Array<Line> = [
      [{ x: lightPoint.x, y: lightPoint.y }, { x: lightPoint.x + Math.cos(radian + RAY_EPSILON) * RAY_LENGTH, y: lightPoint.y + Math.sin(radian + RAY_EPSILON) * RAY_LENGTH }],
      [{ x: lightPoint.x, y: lightPoint.y }, { x: lightPoint.x + Math.cos(radian - RAY_EPSILON) * RAY_LENGTH, y: lightPoint.y + Math.sin(radian - RAY_EPSILON) * RAY_LENGTH }],
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
    const prevVector = Math.abs(prevPoint.x - point.x) <= EPSILON ? 'y' : (Math.abs(prevPoint.y - point.y) <= EPSILON ? 'x' : undefined);
    const nextVector = Math.abs(nextPoint.x - point.x) <= EPSILON ? 'y' : (Math.abs(nextPoint.y - point.y) <= EPSILON ? 'x' : undefined);

    if (!prevVector || !nextVector || prevVector !== nextVector) vertices.push({ x: Math.round(point.x), y: Math.round(point.y) });

    return vertices;
  }, []);
}

export {
  getLightingPolygon
};