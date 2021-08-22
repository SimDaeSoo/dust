type Point = { x: number, y: number };
type Line = [Point, Point];
type Vector = { x: number, y: number };
type Grid = Array<Array<boolean | number>>;
type Binary = 0 | 1;
type Boundary<T> = { min: T, max: T };
type Square = { x: number, y: number, w: number, h: number };
type Dictionary<T> = { [key: string]: T };

export {
  Point,
  Line,
  Vector,
  Grid,
  Binary,
  Boundary,
  Square,
  Dictionary,
}