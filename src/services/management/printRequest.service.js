import { get, post, put, remove } from "../http.service";

export const getFilteredPrintRequests = (query, showSpinner = true) => {
  return get(`/management/print-request/filtered-requests`, query, showSpinner);
};

export const getPrintRequests = (query, showSpinner = true) => {
  return get(`/management/print-request`, query, showSpinner);
};

export const createPrintRequest = (data, showSpinner = true) => {
  return post("/management/print-request", data, {}, showSpinner);
};

export const updatePrintRequest = (id, data, showSpinner = true) => {
  return put(`/management/print-request/${id}`, data, {}, showSpinner);
};

export const deletePrintRequest = (id, showSpinner = true) => {
  return remove(`/management/print-request/${id}`, {}, showSpinner);
};
