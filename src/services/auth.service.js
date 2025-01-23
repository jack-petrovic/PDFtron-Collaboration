import store from "../redux/store";
import { AUTH_ACTIONS } from "../redux/action-types";
import { post, get, put } from "./http.service";
import { setAccount } from "../redux/actions";
import { ToastService } from "../services";
import { setToken } from "../redux/actions";

export class AuthService {
  static async getAccount(showSpinner = true) {
    store.dispatch({
      type: AUTH_ACTIONS.GET_ACCOUNT_REQUEST
    })
    const res = await get("/auth", {}, {}, showSpinner);
    store.dispatch(setAccount(res.account));
    if (!res.account.roleId) {
      ToastService.warning(
        "Please contact administrator to approve your profile.",
      );
    }
    return res;
  }

  static async login({ emailOrUserId, password, showSpinner = true }) {
    const res = await post("/auth/login", { emailOrUserId, password }, {}, showSpinner);
    store.dispatch(setToken({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    }));
  }

  static register({
    name,
    email,
    userId,
    password,
    birthday,
    gender,
    showSpinner = true,
  }) {
    return post(
      "/auth/register",
      { name, email, userId, password, birthday, gender },
      showSpinner,
    );
  }

  static refresh(showSpinner = true) {
    const refreshToken = localStorage.getItem("refresh-token");
    return post("/auth/refresh", { refreshToken }, showSpinner);
  }

  static logout() {
    return post("/auth/logout");
  }

  static changePassword(data, showSpinner = true) {
    return put("/auth/change-password", data, {}, showSpinner);
  }
}
