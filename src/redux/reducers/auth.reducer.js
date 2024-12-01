import { AUTH_ACTIONS } from "../action-types";

const initialState = {
  tokens: undefined,
  account: undefined,
  error: null,
  hasError: false,
  redirectTo: "",
};

const authReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case AUTH_ACTIONS.SET_TOKEN:
      return {
        ...state,
        tokens: payload.tokens,
        error: null,
      };

    case AUTH_ACTIONS.SET_ACCOUNT:
      return {
        ...state,
        account: payload,
        hasError: false,
        error: null,
      };

    case AUTH_ACTIONS.GET_ACCOUNT_ERROR:
      return {
        ...state,
        account: null,
        hasError: true,
        error: payload,
      };

    case AUTH_ACTIONS.SET_REDIRECT_TO:
      return {
        ...state,
        redirectTo: payload,
      };
    default:
      return state;
  }
};

export default authReducer;
