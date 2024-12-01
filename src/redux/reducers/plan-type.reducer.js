import { PLANTYPES_ACTIONS } from "../action-types";

const initialState = {
  planTypes: [],
};

const planTypeReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case PLANTYPES_ACTIONS.SET_PLANTYPES:
      return {
        ...state,
        planTypes: payload.planTypes,
      };

    case PLANTYPES_ACTIONS.ADD_PLANTYPE:
      return {
        ...state,
        planTypes: [...state.planTypes, payload.planType],
      };

    case PLANTYPES_ACTIONS.DELETE_PLANTYPE:
      return {
        ...state,
        planTypes: state.planTypes.filter(
          (planType) => planType.id !== payload.id,
        ),
      };

    case PLANTYPES_ACTIONS.EDIT_PLANTYPE:
      return {
        ...state,
        planTypes: state.planTypes.map((planType) => {
          if (planType.id === payload.planType.id) {
            planType = payload.planType;
          }
          return planType;
        }),
      };

    default:
      return state;
  }
};

export default planTypeReducer;
