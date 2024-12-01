import { get, remove, put } from "./http.service";

export const getNotifications = (query = {}, showSpinner = true) => {
  return get("/notification", query, {}, showSpinner);
};

export const getCountNotifications = (query = {}, showSpinner = true) => {
  return get("/notification/count", query, {}, showSpinner);
};

export const markAllAsRead = (query, showSpinner = true) => {
  return put(`/notification/mark-read`, query, {}, showSpinner);
};

export const readNotification = (id, showSpinner = true) => {
  return put(`/notification/${id}`, {}, {}, showSpinner);
};

export const clearAllNotifications = (query = {}, showSpinner = true) => {
  return remove("/notification", query, {}, showSpinner);
};

export const deleteNotification = (id, showSpinner = true) => {
  return remove(`/notification/${id}`, {}, {}, showSpinner);
};
