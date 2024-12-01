import { PLANTYPES_ACTIONS } from "../action-types";

export const setPlanTypes = (planTypes) => {
  return {
    type: PLANTYPES_ACTIONS.SET_PLANTYPES,
    payload: {
      planTypes,
    },
  };
};

export const addPlanType = (planType) => {
  return {
    type: PLANTYPES_ACTIONS.ADD_PLANTYPE,
    payload: {
      planType,
    },
  };
};

export const removePlanType = (id) => {
  return {
    type: PLANTYPES_ACTIONS.DELETE_PLANTYPE,
    payload: {
      id,
    },
  };
};

export const editPlanType = (planType) => {
  return {
    type: PLANTYPES_ACTIONS.EDIT_PLANTYPE,
    payload: {
      planType,
    },
  };
};
