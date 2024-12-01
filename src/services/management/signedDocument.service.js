import { get, post, put, remove } from "../http.service";

export const createSignedDocument = (data, showSpinner = true) => {
  return post("/management/signed-document", data, {}, showSpinner);
};

export const getSignedDocuments = (query = {}, showSpinner = true) => {
  return get("/management/signed-document", query, {}, showSpinner);
};

export const updateSignedDocument = (id, data, showSpinner = true) => {
  return put(`/management/signed-document/${id}`, data, showSpinner);
};

export const deleteSignedDocument = (id, showSpinner = true) => {
  return remove(`/management/signed-document/${id}`, {}, showSpinner);
};
