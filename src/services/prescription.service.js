import { get, post, put, remove } from "./http.service";

export const getPrescriptions = (query, showSpinner = true) => {
  return get(`/prescription`, query, showSpinner);
};

export const getPrescription = (id, showSpinner = true) => {
  return get(`/prescription/${id}`, {}, showSpinner);
};

export const createPrescription = (data, showSpinner = true) => {
  return post("/prescription", data, {}, showSpinner);
};

export const updatePrescription = (id, data, showSpinner = true) => {
  return put(`/prescription/${id}`, data, {}, showSpinner);
};

export const deletePrescription = (id, showSpinner = true) => {
  return remove(`/prescription/${id}`, {}, showSpinner);
};
