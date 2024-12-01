import { post, get } from "./http.service";

export class AuthService {
  static getAccount(showSpinner = true) {
    return get("/auth", {}, {}, showSpinner);
  }

  static login({ emailOrUserId, password, showSpinner = true }) {
    return post("/auth/login", { emailOrUserId, password }, {}, showSpinner);
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
}
