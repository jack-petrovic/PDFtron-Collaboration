import { SPINNER_ACTION } from "../action-types";

export const startLoading = () => ({
  type: SPINNER_ACTION.START_LOADING,
});

export const finishLoading = () => ({
  type: SPINNER_ACTION.FINISH_LOADING,
});
