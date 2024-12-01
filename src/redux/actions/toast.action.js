import { TOAST_ACTIONS } from "../action-types";

export const showToast = (options) => ({
  type: TOAST_ACTIONS.SHOW_TOAST,
  options,
});

export const closeToast = () => ({
  type: TOAST_ACTIONS.CLOSE_TOAST,
});
