import { MUTATION_CONDITION_KEY, MUTATION_OPERATOR, STATE, StateData, Vector } from "../interfaces"

const SAMPLE_CHARACTER_STATE: StateData = {
  [STATE.IDLE]: [
    {
      conditions: [
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_Y, operator: MUTATION_OPERATOR.MORE_EQUAL_THAN, value: 0.1 }
      ],
      mutate: STATE.JUMP
    },
    {
      conditions: [
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_Y, operator: MUTATION_OPERATOR.LESS_THAN, value: 0.1 },
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_X, operator: MUTATION_OPERATOR.MORE_THAN, value: 0 }
      ],
      mutate: STATE.WALK
    }
  ],
  [STATE.JUMP]: [
    {
      conditions: [
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_Y, operator: MUTATION_OPERATOR.LESS_THAN, value: 0.1 },
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_X, operator: MUTATION_OPERATOR.EQUAL, value: 0 }
      ],
      mutate: STATE.IDLE
    },
    {
      conditions: [
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_Y, operator: MUTATION_OPERATOR.LESS_THAN, value: 0.1 },
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_X, operator: MUTATION_OPERATOR.MORE_THAN, value: 0 }
      ],
      mutate: STATE.WALK
    }
  ],
  [STATE.WALK]: [
    {
      conditions: [
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_Y, operator: MUTATION_OPERATOR.LESS_THAN, value: 0.1 },
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_X, operator: MUTATION_OPERATOR.EQUAL, value: 0 }
      ],
      mutate: STATE.IDLE
    },
    {
      conditions: [
        { key: MUTATION_CONDITION_KEY.VECTOR_ABS_Y, operator: MUTATION_OPERATOR.MORE_EQUAL_THAN, value: 0.1 },
      ],
      mutate: STATE.JUMP
    }
  ]
};

class StateManager<T extends { vector: Vector }> {
  private stateData: StateData;
  private base: T;
  public currentState: STATE;

  constructor(options: { stateData: StateData, defaultState: STATE, base: T }) {
    this.stateData = options.stateData;
    this.currentState = options.defaultState;
    this.base = options.base;
  }

  update() {
    for (const mutableState of this.stateData[this.currentState]) {
      let mutable: boolean = true;

      for (const condition of mutableState.conditions) {
        let value: number | string;

        switch (condition.key) {
          case MUTATION_CONDITION_KEY.VECTOR_ABS_X: {
            value = Math.abs(this.base.vector.x);
            break;
          }
          case MUTATION_CONDITION_KEY.VECTOR_ABS_Y: {
            value = Math.abs(this.base.vector.y);
            break;
          }
          case MUTATION_CONDITION_KEY.VECTOR_X: {
            value = this.base.vector.x;
            break;
          }
          case MUTATION_CONDITION_KEY.VECTOR_Y: {
            value = this.base.vector.y;
            break;
          }
        }

        switch (condition.operator) {
          case MUTATION_OPERATOR.EQUAL: {
            mutable = mutable && value === condition.value;
            break;
          }
          case MUTATION_OPERATOR.NOT_EQUAL: {
            mutable = mutable && value != condition.value;
            break;
          }
          case MUTATION_OPERATOR.LESS_EQUAL_THAN: {
            mutable = mutable && value <= condition.value;
            break;
          }
          case MUTATION_OPERATOR.LESS_THAN: {
            mutable = mutable && value < condition.value;
            break;
          }
          case MUTATION_OPERATOR.MORE_EQUAL_THAN: {
            mutable = mutable && value >= condition.value;
            break;
          }
          case MUTATION_OPERATOR.MORE_THAN: {
            mutable = mutable && value > condition.value;
            break;
          }
        }
      }

      if (mutable) {
        this.currentState = mutableState.mutate;
        break;
      }
    }
  }
};

export default StateManager;