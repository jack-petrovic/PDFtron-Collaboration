import { get, post, put, remove } from "../http.service";

export const getProhibitedWords = (query = {}, showSpinner = true) => {
  return get("/management/prohibited-word", query, showSpinner);
};

export const createProhibitedWord = (data, showSpinner = true) => {
  return post("/management/prohibited-word", data, {}, showSpinner);
};

export const updateProhibitedWord = (id, data, showSpinner = true) => {
  return put(`/management/prohibited-word/${id}`, data, {}, showSpinner);
};

export const deleteProhibitedWord = (id, showSpinner = true) => {
  return remove(`/management/prohibited-word/${id}`, {}, showSpinner);
};
