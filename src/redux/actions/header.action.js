import { HEADER_ACTIONS } from "../action-types";

export const setSearch = (value, operator, column) => {
  return {
    type: HEADER_ACTIONS.SET_SEARCH,
    payload: {
      search: value,
      operator: operator,
      column: column,
    },
  };
};
