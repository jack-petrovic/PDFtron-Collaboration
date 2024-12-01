import { get, post, put, remove } from "../http.service";

export const createSubSection = (data, showSpinner = true) => {
  return post("/management/sub-section", data, {}, (showSpinner = true));
};

export const getSubSections = (query = {}, showSpinner = true) => {
  return get("/management/sub-section", query, showSpinner);
};

export const updateSubSection = (id, data, showSpinner = true) => {
  return put(`/management/sub-section/${id}`, data, {}, showSpinner);
};

export const deleteSubSection = (id, showSpinner = true) => {
  return remove(`/management/sub-section/${id}`, {}, showSpinner);
};
