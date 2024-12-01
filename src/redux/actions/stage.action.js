import { STAGE_ACTIONS } from "../action-types";

export const setStages = (stages) => {
  return {
    type: STAGE_ACTIONS.SET_STAGES,
    payload: {
      stages,
    },
  };
};

export const addStage = (stage) => {
  return {
    type: STAGE_ACTIONS.ADD_STAGE,
    payload: {
      stage,
    },
  };
};

export const removeStage = (id) => {
  return {
    type: STAGE_ACTIONS.DELETE_STAGE,
    payload: {
      id,
    },
  };
};

export const editStage = (stage) => {
  return {
    type: STAGE_ACTIONS.EDIT_STAGE,
    payload: {
      stage,
    },
  };
};
