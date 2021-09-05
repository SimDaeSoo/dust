type Point = { x: number, y: number };
type Line = [Point, Point];
type Vector = { x: number, y: number };
type Grid<T> = Array<Array<T>>;
type Binary = 0 | 1;
type Boundary<T> = { min: T, max: T };
type Square = { x: number, y: number, w: number, h: number };
type Dictionary<T> = { [key: string]: T };
type Tile = {
  tileType: number,
  tileNumber: number,
  backgroundTileType: number,
  backgroundTileNumber: number,
  lightLevel: number,
  movable: boolean,
  liquid: number,
  diff: number,
  stable: boolean,
  stableLevel: number,
  checked: boolean,
};
type MapData = {
  seed: string,
  tileSize: number,
  width: number,
  height: number,
  grid: Grid<Tile>,
  unstablePoints: Array<Point>,
  nextUnstablePoints: Array<Point>,
}
type CollisionDirectionLine = {
  dt: number,
  direction: DIRECTION,
  line: Line,
  duplicated: boolean,
}
const enum DIRECTION {
  LEFT = 0,
  RIGHT = 1,
  TOP = 2,
  BOTTOM = 3
};
const enum MUTATION_CONDITION_KEY {
  VECTOR_ABS_X,
  VECTOR_ABS_Y,
  VECTOR_X,
  VECTOR_Y,
};
const enum MUTATION_OPERATOR {
  MORE_THAN,
  LESS_THAN,
  MORE_EQUAL_THAN,
  LESS_EQUAL_THAN,
  EQUAL,
  NOT_EQUAL,
};
const enum STATE {
  IDLE,
  JUMP,
  WALK,
}
type StateData = {
  [key in STATE]: Array<
    {
      conditions: Array<{ key: MUTATION_CONDITION_KEY; operator: MUTATION_OPERATOR; value: number | string; }>;
      mutate: STATE;
    }
  >;
};


export {
  Point,
  Line,
  Vector,
  Grid,
  Binary,
  Boundary,
  Square,
  Dictionary,
  Tile,
  MapData,
  CollisionDirectionLine,
  DIRECTION,
  MUTATION_CONDITION_KEY,
  MUTATION_OPERATOR,
  STATE,
  StateData,
}