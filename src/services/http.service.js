import axios from "axios";
import { API_SERVER } from "../constants";
import { AuthService } from "./auth.service";
import store from "../redux/store";
import _ from "lodash";
import { setToken, setAccount } from "../redux/actions";

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
          message: "Your session was expired, please login again.",
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
    err.response.data.message = "Your session was expired, please login again.";
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
          throw err;
        });
    }

    triggerLogout();
    throw err;
  }

  store.dispatch(setToken(null));
  throw err;
};

async function request(method, url, options) {
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
}

function get(url, params, headers) {
  return request("GET", url, { params, headers });
}

function post(url, body, headers) {
  return request("POST", url, { data: body, headers });
}

function put(url, body, headers) {
  return request("PUT", url, { data: body, headers });
}

function patch(url, body, headers) {
  return request("PATCH", url, { data: body, headers });
}

function remove(url, body, headers) {
  return request("DELETE", url, { data: body, headers });
}

export { get, post, put, patch, remove };
