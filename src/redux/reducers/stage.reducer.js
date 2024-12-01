import { STAGE_ACTIONS } from "../action-types";

const initialState = {
  stages: [],
};

const stageReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case STAGE_ACTIONS.SET_STAGES:
      return {
        ...state,
        stages: payload.stages,
      };

    case STAGE_ACTIONS.ADD_STAGE:
      return {
        ...state,
        stages: [...state.stages, payload.stage],
      };

    case STAGE_ACTIONS.DELETE_STAGE:
      return {
        ...state,
        stages: state.stages.filter((stage) => stage.id !== payload.id),
      };

    case STAGE_ACTIONS.EDIT_STAGE:
      return {
        ...state,
        stages: state.stages.map((stage) => {
          if (stage.id === payload.stage.id) {
            stage = payload.stage;
          }
          return stage;
        }),
      };

    default:
      return state;
  }
};

export default stageReducer;
