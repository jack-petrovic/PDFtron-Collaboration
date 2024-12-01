import { SUBPLANTYPES_ACTIONS } from "../action-types";

export const setSubPlanTypes = (subPlanTypes) => {
  return {
    type: SUBPLANTYPES_ACTIONS.SET_SUBPLANTYPES,
    payload: {
      subPlanTypes,
    },
  };
};

export const addSubPlanType = (subPlanType) => {
  return {
    type: SUBPLANTYPES_ACTIONS.ADD_SUBPLANTYPE,
    payload: {
      subPlanType,
    },
  };
};

export const editSubPlanType = (subPlanType) => {
  return {
    type: SUBPLANTYPES_ACTIONS.EDIT_SUBPLANTYPE,
    payload: {
      subPlanType,
    },
  };
};

export const removeSubPlanType = (id) => {
  return {
    type: SUBPLANTYPES_ACTIONS.DELETE_SUBPLANTYPE,
    payload: {
      id,
    },
  };
};
