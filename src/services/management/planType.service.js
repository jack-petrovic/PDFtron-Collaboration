import { get, post, put, remove } from "../http.service";

export const createType = (data, showSpinner = true) => {
  return post("/management/plan-type", data, {}, showSpinner);
};

export const getTypes = (query, showSpinner = true) => {
  return get(`/management/plan-type`, query, showSpinner);
};

export const updateType = (id, data, showSpinner = true) => {
  return put(`/management/plan-type/${id}`, data, {}, showSpinner);
};

export const deleteType = (id, showSpinner = true) => {
  return remove(`/management/plan-type/${id}`, {}, showSpinner);
};
