import { TOAST_ACTIONS } from "../action-types";

const initialState = {
  toastOptions: [],
};

const toastReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOAST_ACTIONS.SHOW_TOAST:
      const id =
        action.options.id || `${state.toastOptions.length}-${Date.now()}`;

      if (state.toastOptions.find((toastOption) => toastOption.id === id)) {
        return state.toastOptions;
      }

      return {
        ...state,
        toastOptions: [
          ...state.toastOptions,
          {
            ...action.options,
            id:
              action.options.id || `${state.toastOptions.length}-${Date.now()}`,
          },
        ],
      };

    case TOAST_ACTIONS.CLOSE_TOAST:
      return {
        ...state,
        toastOptions: state.toastOptions.filter((_, index) => index > 0),
      };

    default:
      return state;
  }
};

export default toastReducer;
