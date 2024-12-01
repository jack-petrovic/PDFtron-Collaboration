import { SUBPLANTYPES_ACTIONS } from "../action-types";

const initialState = {
  subPlanTypes: [],
};

const subPlanTypeReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SUBPLANTYPES_ACTIONS.SET_SUBPLANTYPES:
      return {
        ...state,
        subPlanTypes: payload.subPlanTypes,
      };

    case SUBPLANTYPES_ACTIONS.ADD_SUBPLANTYPE:
      return {
        ...state,
        subPlanTypes: [...state.subPlanTypes, payload.subPlanType],
      };

    case SUBPLANTYPES_ACTIONS.DELETE_SUBPLANTYPE:
      return {
        ...state,
        subPlanTypes: state.subPlanTypes.filter(
          (subPlanType) => subPlanType.id !== payload.id,
        ),
      };

    case SUBPLANTYPES_ACTIONS.EDIT_SUBPLANTYPE:
      return {
        ...state,
        subPlanTypes: state.subPlanTypes.map((subPlanType) => {
          if (subPlanType.id === payload.subPlanType.id) {
            subPlanType = payload.subPlanType;
          }
          return subPlanType;
        }),
      };

    default:
      return state;
  }
};

export default subPlanTypeReducer;
