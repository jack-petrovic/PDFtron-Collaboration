import { get, post, put, remove } from "../http.service";

export const getPaperSizes = (query, showSpinner = true) => {
  return get("/management/paper-size", query, showSpinner);
};

export const createPaperSize = (data, showSpinner = true) => {
  return post("/management/paper-size", data, {}, showSpinner);
};

export const updatePaperSize = (id, data, showSpinner = true) => {
  return put(`/management/paper-size/${id}`, data, {}, showSpinner);
};

export const deletePaperSize = (id, showSpinner = true) => {
  return remove(`/management/paper-size/${id}`, {}, showSpinner);
};
