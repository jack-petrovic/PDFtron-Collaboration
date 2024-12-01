import { get, post, put, remove } from "../http.service";

export const createSubType = (data, showSpinner = true) => {
  return post("/management/sub-plan", data, {}, showSpinner);
};

export const getSubPlanTypes = (query, showSpinner = true) => {
  return get("/management/sub-plan", query, showSpinner);
};

export const getAllSubPlanTypes = (query, showSpinner = true) => {
  return get("/management/sub-plan/all", query, showSpinner);
};

export const updateSubType = (id, data, showSpinner = true) => {
  return put(`/management/sub-plan/${id}`, data, {}, showSpinner);
};

export const deleteSubType = (id, showSpinner = true) => {
  return remove(`/management/sub-plan/${id}`, {}, showSpinner);
};
