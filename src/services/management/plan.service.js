import { get, post, put, remove } from "../http.service";

export const createPlan = (data, showSpinner = true) => {
  return post("/management/plan", data, {}, showSpinner);
};

export const generatePlans = (data, showSpinner = true) => {
  return post("/management/plan/generate", data, showSpinner);
};

export const getPlans = (query = {}, showSpinner = true) => {
  return get("/management/plan", query, showSpinner);
};

export const getAllPlans = (showSpinner = true) => {
  return get("/management/plan/all", {}, showSpinner);
};

export const getProgressPlans = (query = {}, showSpinner = true) => {
  return get("/management/plan/progressing", query, showSpinner);
};

export const getPlan = (id, showSpinner = true) => {
  return get(`/management/plan/${id}`, {}, showSpinner);
};

export const updatePlan = (id, data, showSpinner = true) => {
  return put(`/management/plan/${id}`, data, {}, showSpinner);
};

export const deletePlan = (id, showSpinner = true) => {
  return remove(`/management/plan/${id}`, {}, showSpinner);
};
