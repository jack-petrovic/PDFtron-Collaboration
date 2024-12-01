import { get, post, put, remove } from "../http.service";

export const getCurrentMonthFixedPlans = (showSpinner = true) => {
  return get("/management/fixed-plan/current-month", {}, showSpinner);
};

export const getFixedPlans = (query = {}, showSpinner = true) => {
  return get("/management/fixed-plan", query, showSpinner);
};

export const getFixedPlan = (id, showSpinner = true) => {
  return get(`/management/fixed-plan/${id}`, {}, showSpinner);
};

export const createFixedPlan = (data, showSpinner = true) => {
  return post("/management/fixed-plan", data, {}, (showSpinner = true));
};

export const updateFixedPlan = (id, data, showSpinner = true) => {
  return put(`/management/fixed-plan/${id}`, data, {}, showSpinner);
};

export const deleteFixedPlan = (id, showSpinner = true) => {
  return remove(`/management/fixed-plan/${id}`, {}, showSpinner);
};
