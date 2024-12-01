import { get, post, put, remove } from "../http.service";

export const createStage = (data, showSpinner = true) => {
  return post("/management/stage", data, {}, showSpinner);
};

export const getStages = (query, showSpinner = true) => {
  return get(`/management/stage`, query, showSpinner);
};

export const updateAllStages = (data, showSpinner = true) => {
  return put("/management/stage/update-all", data, {}, showSpinner);
};

export const updateStage = (id, data, showSpinner = true) => {
  return put(`/management/stage/${id}`, data, {}, showSpinner);
};

export const deleteStage = (id, showSpinner = true) => {
  return remove(`/management/stage/${id}`, {}, showSpinner);
};
