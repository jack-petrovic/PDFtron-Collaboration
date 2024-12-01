import { get, post, put, remove } from "../http.service";

export const createSection = (data, showSpinner = true) => {
  return post("/management/section", data, {}, (showSpinner = true));
};

export const getSections = (query = {}, showSpinner = true) => {
  return get("/management/section", query, showSpinner);
};

export const updateSection = (id, data, showSpinner = true) => {
  return put(`/management/section/${id}`, data, {}, showSpinner);
};

export const deleteSection = (id, showSpinner = true) => {
  return remove(`/management/section/${id}`, {}, showSpinner);
};
