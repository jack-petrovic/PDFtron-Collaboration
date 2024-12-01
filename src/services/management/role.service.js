import { get, post, put, remove } from "../http.service";

export const createRole = (data, showSpinner = true) => {
  return post("/management/user-role", data, {}, showSpinner);
};

export const getRoles = (query, showSpinner = true) => {
  return get(`/management/user-role`, query, showSpinner);
};

export const updateRole = (id, data, showSpinner = true) => {
  return put(`/management/user-role/${id}`, data, {}, showSpinner);
};

export const deleteRole = (id, showSpinner = true) => {
  return remove(`/management/user-role/${id}`, {}, showSpinner);
};
