import { get, post } from "./http.service";

export const createComparison = (data, showSpinner = true) => {
  return post("/comparisons", data, {}, showSpinner);
};

export const getComparison = (id, showSpinner = true) => {
  return get(`/comparisons/${id}`, {}, showSpinner);
};
