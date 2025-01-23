import axios from "axios";
import { API_SERVER } from "../constants";
import { AuthService } from "./auth.service";
import store from "../redux/store";
import _ from "lodash";
import { setToken, setAccount } from "../redux/actions";
import { ToastService } from "./toast.service";
import i18n from "../i18n";

const http = axios.create({ baseURL: `${API_SERVER}/` });

let reqQueue = [];

const _refreshTokens = _.debounce((resolve, reject) => {
  const {
    authReducer: { tokens },
  } = store.getState();
  if (!tokens?.refreshToken) {
    return reject();
  }

  return AuthService.refresh(tokens.refreshToken)
    .then((data) => {
      store.dispatch(
        setToken({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      resolve(data);
    })
    .catch((err) => reject(err));
}, 100);

const refreshTokens = (resolve, reject) => {
  reqQueue.push({ resolve, reject });
  _refreshTokens(
    (data) => {
      reqQueue.forEach((req) => {
        req.resolve(data);
      });
      reqQueue = [];
    },
    (err) => {
      if (reqQueue.length) {
        reqQueue[0].reject({
          ...err,
          message: "Your session has expired, please login again.",
        });
      }
      reqQueue = [];
    },
  );
};

const triggerLogout = () => {
  store.dispatch(setToken(null));
  store.dispatch(setAccount(null));
};

const httpResponseHandler = (response) => {
  return response.data;
};

const httpErrorHandler = async (err, refresh = true) => {
  const response = err?.response;
  if (response?.status === 403) {
    err.response.data.message = "Your session has expired, please login again.";
    if (refresh) {
      return new Promise((resolve, reject) => {
        return refreshTokens(resolve, reject);
      })
        .then((tokens) => {
          err.config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return http
            .request(err.config)
            .then(httpResponseHandler)
            .catch((error) => httpErrorHandler(error, false));
        })
        .catch(async () => {
          triggerLogout();
          ToastService.error(i18n.t(err.response?.data?.message || "common_network_error"));
          throw err;
        });
    }

    triggerLogout();
    ToastService.error(i18n.t(err.response?.data?.message || "session_expired"));
    throw err;
  }

  store.dispatch(setToken(null));
  ToastService.error(i18n.t(err.response?.data?.message || "common_network_error"));
  throw err;
};

const request = async (method, url, options) => {
  const token = localStorage.getItem("access-token");
  const headers = options.headers || {};

  return await http
    .request({
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
      method,
      url,
    })
    .then(httpResponseHandler)
    .catch(httpErrorHandler);
};

const get = (url, params, headers) => {
  return request("GET", url, { params, headers });
};

const post = (url, body, headers) => {
  return request("POST", url, { data: body, headers });
};

const put = (url, body, headers) => {
  return request("PUT", url, { data: body, headers });
};

const patch = (url, body, headers) => {
  return request("PATCH", url, { data: body, headers });
};

const remove = (url, body, headers) => {
  return request("DELETE", url, { data: body, headers });
};

export { get, post, put, patch, remove };
