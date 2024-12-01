import { AuthService, ToastService } from "../../services";
import { AUTH_ACTIONS } from "../action-types";

export const setToken = (tokens) => ({
  type: AUTH_ACTIONS.SET_TOKEN,
  payload: { tokens },
});

export const setAccount = (account) => ({
  type: AUTH_ACTIONS.SET_ACCOUNT,
  payload: account,
});

export const loginAction = (data) => async (dispatch) => {
  try {
    const res = await AuthService.login(data);
    dispatch(
      setToken({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      }),
    );
    return res;
  } catch (err) {
    throw err;
  }
};

export const registerAction = (data) => async (dispatch) => {
  try {
    const res = await AuthService.register(data);
    dispatch(setToken(res));
    return res;
  } catch (err) {
    throw err;
  }
};

export const getAccountAction = () => async (dispatch) => {
  dispatch({
    type: AUTH_ACTIONS.GET_ACCOUNT_REQUEST,
  });

  try {
    const res = await AuthService.getAccount();
    dispatch(setAccount(res.account));
    if (!res.account.roleId) {
      ToastService.warning(
        "Please contact administrator to approve your profile.",
      );
    }
    return res;
  } catch (err) {
    dispatch({
      type: AUTH_ACTIONS.GET_ACCOUNT_ERROR,
    });
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
