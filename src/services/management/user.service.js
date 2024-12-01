import { get, remove, put, post } from "../http.service";

export const getUsers = (query = {}, showSpinner = true) => {
  return get("/management/users", query, {}, showSpinner);
};

export const createUser = (data, showSpinner = true) => {
  return post("/management/users", data, {}, showSpinner);
};

export const uploadAvatar = (id, form, showSpinner = true) => {
  return post(`/management/users/upload-avatars/${id}`, form, {}, showSpinner);
};

export const updateUser = (id, data, showSpinner = true) => {
  return put(`/management/users/${id}`, data, {}, showSpinner);
};

export const resetPassword = (id, showSpinner = true) => {
  return put(`/management/users/reset-password/${id}`, {}, showSpinner);
};

export const deleteUser = (id, showSpinner = true) => {
  return remove(`/management/users/${id}`, {}, showSpinner);
};
