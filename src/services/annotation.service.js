import { get, post, put, remove } from "./http.service";

export const getAnnotations = (query = {}, showSpinner = true) => {
  return get("/annotations", query, {}, showSpinner);
};

export const getAnnotation = (id, showSpinner = true) => {
  return get(`/annotations/${id}`, {}, {}, showSpinner);
};

export const createAnnotation = (data, showSpinner = true) => {
  return post("/annotations/", data, {}, showSpinner);
};

export const updateAnnotation = (id, data, showSpinner = true) => {
  return put(`/annotations/${id}`, data, showSpinner);
};

export const deleteAnnotation = (id, showSpinner = true) => {
  return remove(`/annotations/${id}`, {}, {}, showSpinner);
};
