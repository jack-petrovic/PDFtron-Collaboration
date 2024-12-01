import { combineReducers } from "redux";
import authReducer from "./auth.reducer";
import headerReducer from "./header.reducer";
import toastReducer from "./toast.reducer";
import spinnerReducer from "./spinner.reducer";
import sectionReducer from "./section.reducer";
import subSectionReducer from "./subsection.reducer";
import planTypeReducer from "./plan-type.reducer";
import subPlanTypeReducer from "./subplan-type.reducer";
import stageReducer from "./stage.reducer";
import roleReducer from "./role.reducer";
import notificationReducer from "./notification.reducer";
import paperSizeReducer from "./paper-size.reducer";
import { AUTH_ACTIONS } from "../action-types";

const appReducer = combineReducers({
  authReducer,
  headerReducer,
  toastReducer,
  spinnerReducer,
  sectionReducer,
  subSectionReducer,
  planTypeReducer,
  subPlanTypeReducer,
  stageReducer,
  roleReducer,
  notificationReducer,
  paperSizeReducer,
});

export const rootReducer = (state, action) => {
  if (action.type === AUTH_ACTIONS.SET_ACCOUNT && !action.payload) {
    return appReducer({}, action);
  }

  return appReducer(state, action);
};
export default rootReducer;
