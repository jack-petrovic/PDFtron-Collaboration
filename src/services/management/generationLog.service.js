import { get, remove } from "../http.service";

export const getLogs = (query = {}, showSpinner = true) => {
  return get("/management/generation-log", query, showSpinner);
};

export const clearLogs = (showSpinner = true) => {
  return remove("/management/generation-log", showSpinner);
};
