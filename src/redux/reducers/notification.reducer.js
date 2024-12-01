import { NOTIFICATION_ACTIONS } from "../action-types";

const initialState = {
  notifications: [],
};

const notificationReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: payload.notifications,
      };

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== payload.id,
        ),
      };

    case NOTIFICATION_ACTIONS.EDIT_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map((notification) => {
          if (notification.id === payload.notification.id) {
            notification = payload.notification;
          }
          return notification;
        }),
      };

    default:
      return state;
  }
};

export default notificationReducer;
