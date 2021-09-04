import { MapData, Tile } from "../interfaces";

const MIN_LIQUID_VALUE = 0.005;
const MAX_LIQUID_VALUE = 1.0;
const MAX_COMPRESSION = 0.25;
const MIN_FLOW = 0.005;
const MAX_FLOW = 4;
const FLOW_SPEED = 1;

function calculateVerticalFlowValue(remainingLiquid: number, destination: Tile): number {
  const sum = remainingLiquid + destination.liquid;

  if (sum <= MAX_LIQUID_VALUE) {
    return MAX_LIQUID_VALUE;
  } else if (sum < 2 * MAX_LIQUID_VALUE + MAX_COMPRESSION) {
    return (MAX_LIQUID_VALUE * MAX_LIQUID_VALUE + sum * MAX_COMPRESSION) / (MAX_LIQUID_VALUE + MAX_COMPRESSION);
  } else {
    return (sum + MAX_COMPRESSION) / 2;
  }
}

function step(map: MapData, options: { currentPartition: number, maximum: number, processOrder: number } = { currentPartition: 0, maximum: map.height * map.width, processOrder: 0 }): { currentPartition: number, maximum: number, processOrder: number } {
  let { currentPartition, maximum, processOrder } = options;
  let accumulation = 0;
  let flow = 0;

  if (processOrder === 0) {
    for (let i = currentPartition; i < map.unstablePoints.length; i++) {
      if (accumulation >= maximum) return { currentPartition, maximum, processOrder: 0 };
      const { x, y } = map.unstablePoints[i];
      const cell = map.grid[y][x];
      let remainingValue = cell.liquid;

      currentPartition++;
      accumulation++;

      if (y < map.height - 1 && map.grid[y + 1][x].movable) {
        flow = calculateVerticalFlowValue(cell.liquid, map.grid[y + 1][x]) - map.grid[y + 1][x].liquid;

        if (map.grid[y + 1][x].liquid > 0 && flow > MIN_FLOW) flow *= FLOW_SPEED;

        flow = Math.max(flow, 0);
        if (flow > Math.min(MAX_FLOW, cell.liquid)) {
          flow = Math.min(MAX_FLOW, cell.liquid);
        }
        if (flow != 0) {
          remainingValue -= flow;
          cell.diff -= flow;
          map.grid[y + 1][x].diff += flow;
        }
      }
      if (remainingValue < MIN_LIQUID_VALUE) cell.diff -= remainingValue;

      if (x > 0 && map.grid[y][x - 1].movable) {
        flow = (remainingValue - map.grid[y][x - 1].liquid) / 4;

        if (flow > MIN_FLOW) flow *= FLOW_SPEED;

        flow = Math.max(flow, 0);
        if (flow > Math.min(MAX_FLOW, remainingValue)) {
          flow = Math.min(MAX_FLOW, remainingValue);
        }

        if (flow != 0) {
          remainingValue -= flow;
          cell.diff -= flow;
          map.grid[y][x - 1].diff += flow;
        }
      }
      if (remainingValue < MIN_LIQUID_VALUE) cell.diff -= remainingValue;

      if (x < map.width - 1 && map.grid[y][x + 1].movable) {
        flow = (remainingValue - map.grid[y][x + 1].liquid) / 3;
        if (flow > MIN_FLOW) flow *= FLOW_SPEED;

        flow = Math.max(flow, 0);
        if (flow > Math.min(MAX_FLOW, remainingValue)) {
          flow = Math.min(MAX_FLOW, remainingValue);
        }

        if (flow != 0) {
          remainingValue -= flow;
          cell.diff -= flow;
          map.grid[y][x + 1].diff += flow;
        }
      }
      if (remainingValue < MIN_LIQUID_VALUE) cell.diff -= remainingValue;

      if (y > 0 && map.grid[y - 1][x].movable) {
        flow = remainingValue - calculateVerticalFlowValue(remainingValue, map.grid[y - 1][x]);
        if (flow > MIN_FLOW) flow *= FLOW_SPEED;

        flow = Math.max(flow, 0);
        if (flow > Math.min(MAX_FLOW, remainingValue)) {
          flow = Math.min(MAX_FLOW, remainingValue);
        }

        if (flow != 0) {
          remainingValue -= flow;
          cell.diff -= flow;
          map.grid[y - 1][x].diff += flow;
        }
      }
    }
  }

  if (processOrder === 0 && currentPartition >= map.unstablePoints.length - 1) {
    processOrder = 1;
    currentPartition = 0;
  }

  if (processOrder === 1) {
    for (let i = currentPartition; i < map.unstablePoints.length; i++) {
      if (accumulation >= maximum) return { currentPartition, maximum, processOrder: 1 };
      const { x, y } = map.unstablePoints[i];
      currentPartition++;
      accumulation++;
      map.grid[y][x].liquid += map.grid[y][x].diff;

      if (map.grid[y][x].liquid < MIN_LIQUID_VALUE) {
        map.grid[y][x].liquid = 0;
        map.grid[y][x].stableLevel = 0;
      }

      if (Math.abs(map.grid[y][x].diff) <= 0.0005) {
        if (map.grid[y][x].stableLevel++ >= 10) {
          map.grid[y][x].stableLevel = 0;
          map.grid[y][x].stable = true;
        } else if (map.grid[y][x].liquid && !map.grid[y][x].checked) {
          map.grid[y][x].checked = true;
          map.grid[y][x].stable = false;
          map.nextUnstablePoints.push({ x, y });
        }
      } else {
        map.grid[y][x].stableLevel = 0;
        if (map.grid[y][x].liquid && !map.grid[y][x].checked) {
          map.grid[y][x].checked = true;
          map.grid[y][x].stable = false;
          map.nextUnstablePoints.push({ x, y });
        }
        if (y > 0 && map.grid[y - 1][x].movable && !map.grid[y - 1][x].checked) {
          map.grid[y - 1][x].checked = true;
          map.grid[y - 1][x].stable = false;
          map.nextUnstablePoints.push({ x, y: y - 1 });
        }
        if (y < map.height - 1 && map.grid[y + 1][x].movable && !map.grid[y + 1][x].checked) {
          map.grid[y + 1][x].checked = true;
          map.grid[y + 1][x].stable = false;
          map.nextUnstablePoints.push({ x, y: y + 1 });
        }
        if (x > 0 && map.grid[y][x - 1].movable && !map.grid[y][x - 1].checked) {
          map.grid[y][x - 1].checked = true;
          map.grid[y][x - 1].stable = false;
          map.nextUnstablePoints.push({ x: x - 1, y });
        }
        if (x < map.width - 1 && map.grid[y][x + 1].movable && !map.grid[y][x + 1].checked) {
          map.grid[y][x + 1].checked = true;
          map.grid[y][x + 1].stable = false;
          map.nextUnstablePoints.push({ x: x + 1, y });
        }
      }

      map.grid[y][x].diff = 0;
    }

    processOrder = 2;
    currentPartition = 0;
  }

  if (processOrder === 2) {
    for (let i = currentPartition; i < map.nextUnstablePoints.length; i++) {
      if (accumulation >= maximum) return { currentPartition, maximum, processOrder: 2 };
      const { x, y } = map.nextUnstablePoints[i];
      currentPartition++;
      accumulation++;
      map.grid[y][x].checked = false;
    }

    map.unstablePoints = map.nextUnstablePoints;
    map.nextUnstablePoints = [];

    return { currentPartition: 0, maximum, processOrder: 0 };
  } else {
    return { currentPartition, maximum, processOrder };
  }
}

export {
  step
};