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

function step(map: MapData, options: { currentPartition: number, maximum: number, flow: number } = { currentPartition: 0, maximum: map.height * map.width, flow: 0 }): { currentPartition: number, maximum: number, flow: number } {
  let { currentPartition, maximum, flow } = options;
  let accumulation = 0;

  if (currentPartition === 0) {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        map.grid[y][x].diff = 0;
      }
    }
  }
  const baseX = Math.floor(currentPartition / map.height) % map.width;
  let baseY = currentPartition % map.height;

  for (let x = baseX; x < map.width; x++) {
    if (accumulation >= maximum) break;
    for (let y = baseY; y < map.height; y++) {
      if (accumulation >= maximum) break;
      const cell = map.grid[y][x];

      currentPartition++;
      accumulation++;

      if (!cell.movable) {
        cell.liquid = 0;
        continue;
      }
      if (cell.liquid == 0) continue;
      if (cell.settled) continue;
      if (cell.liquid < MIN_LIQUID_VALUE) {
        cell.liquid = 0;
        continue;
      }

      let startValue = cell.liquid;
      let remainingValue = cell.liquid;
      flow = 0;

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
          map.grid[y + 1][x].settled = false;
        }
      }

      if (remainingValue < MIN_LIQUID_VALUE) {
        cell.diff -= remainingValue;
        continue;
      }

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
          map.grid[y][x - 1].settled = false;
        }
      }

      if (remainingValue < MIN_LIQUID_VALUE) {
        cell.diff -= remainingValue;
        continue;
      }

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
          map.grid[y][x + 1].settled = false;
        }
      }

      if (remainingValue < MIN_LIQUID_VALUE) {
        cell.diff -= remainingValue;
        continue;
      }

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
          map.grid[y - 1][x].settled = false;
        }
      }

      if (remainingValue < MIN_LIQUID_VALUE) {
        cell.diff -= remainingValue;
        continue;
      }

      if (startValue == remainingValue) {
        cell.settleCount++;
        if (cell.settleCount >= 10) cell.settled = true;
      } else {
        if (y > 0 && map.grid[y - 1][x]) map.grid[y - 1][x].settled = false;
        if (y < map.height - 1 && map.grid[y + 1][x]) map.grid[y + 1][x].settled = false;
        if (x > 0 && map.grid[y][x - 1]) map.grid[y][x - 1].settled = false;
        if (x < map.width - 1 && map.grid[y][x + 1]) map.grid[y][x + 1].settled = false;
      }
    }

    baseY = 0;
  }

  if (currentPartition >= map.width * map.height) {
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        map.grid[y][x].liquid += map.grid[y][x].diff;
        if (map.grid[y][x].liquid < MIN_LIQUID_VALUE) {
          map.grid[y][x].liquid = 0;
          map.grid[y][x].settled = false;
        }
      }
    }
    return { currentPartition: 0, maximum, flow: 0 };
  } else {
    return { currentPartition, maximum, flow };
  }
}

export {
  step
};