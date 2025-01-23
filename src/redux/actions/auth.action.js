import { AuthService } from "../../services";
import { AUTH_ACTIONS } from "../action-types";

export const setToken = (tokens) => ({
  type: AUTH_ACTIONS.SET_TOKEN,
  payload: { tokens },
});

export const setAccount = (account) => ({
  type: AUTH_ACTIONS.SET_ACCOUNT,
  payload: account,
});

export const registerAction = (data) => async (dispatch) => {
  try {
    const res = await AuthService.register(data);
    dispatch(setToken(res));
    return res;
  } catch (err) {
    throw err;
  }
};

export const logoutAction = () => async (dispatch) => {
  try {
    await AuthService.logout();
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    dispatch(setAccount(null));
    dispatch(setToken(null));
  } catch (err) {
    dispatch({
      type: AUTH_ACTIONS.GET_ACCOUNT_ERROR,
      payload: err.response?.data?.message,
    });
  }
};

export const setRedirectTo = (redirectTo) => ({
  type: AUTH_ACTIONS.SET_REDIRECT_TO,
  payload: redirectTo,
});
