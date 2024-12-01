import { HEADER_ACTIONS } from "../action-types";

const initialState = {
  search: "",
  operator: "contains",
  column: "",
};

const headerReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case HEADER_ACTIONS.SET_SEARCH:
      return {
        ...state,
        search: payload.search,
        column: payload.column,
        operator: payload.operator,
      };
    default:
      return state;
  }
};

export default headerReducer;
