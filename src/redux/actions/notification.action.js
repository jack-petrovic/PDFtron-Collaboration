import { NOTIFICATION_ACTIONS } from "../action-types";

export const setNotifications = (notifications) => {
  return {
    type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
    payload: {
      notifications,
    },
  };
};

export const removeNotification = (id) => {
  return {
    type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION,
    payload: {
      id,
    },
  };
};
