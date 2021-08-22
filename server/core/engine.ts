import { Line, Boundary, Square, Vector } from '../types';

function lineIntersection(lineA: Line, lineB: Line): number {
  const det: number = (lineA[1].x - lineA[0].x) * (lineB[1].y - lineB[0].y) - (lineB[1].x - lineB[0].x) * (lineA[1].y - lineA[0].y);

  if (det === 0) {
    const onSamePointA: boolean = (lineA[0].x === lineB[0].x && lineA[0].y === lineB[0].y) || (lineA[0].x === lineB[1].x && lineA[0].y === lineB[1].y);
    const onSamePointB: boolean = (lineA[1].x === lineB[0].x && lineA[1].y === lineB[0].y) || (lineA[1].x === lineB[1].x && lineA[1].y === lineB[1].y);
    const onSamePoint: boolean = onSamePointA || onSamePointB;

    return onSamePoint ? (onSamePointA ? 0 : 1) : -1;
  } else {
    const t1: number = ((lineB[1].y - lineB[0].y) * (lineB[1].x - lineA[0].x) + (lineB[0].x - lineB[1].x) * (lineB[1].y - lineA[0].y)) / det;
    const t2: number = ((lineA[0].y - lineA[1].y) * (lineB[1].x - lineA[0].x) + (lineA[1].x - lineA[0].x) * (lineB[1].y - lineA[0].y)) / det;

    return (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) ? (t1 < t2 ? t2 : t1) : -1;
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
  lineIntersection,
  vectorSquareInterSection
};