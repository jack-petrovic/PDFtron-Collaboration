import { SPINNER_ACTION } from "../action-types";

const initialState = {
  loadingCount: 0,
};

const spinnerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SPINNER_ACTION.START_LOADING:
      return {
        ...state,
        loadingCount: state.loadingCount + 1,
      };

    case SPINNER_ACTION.FINISH_LOADING:
      return {
        ...state,
        loadingCount: Math.max(state.loadingCount - 1, 0),
      };

    default:
      return state;
  }
};

export default spinnerReducer;
