import { createStore, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import * as History from "history";
import rootReducer from "./reducers";

export const history = History.createBrowserHistory();

const middleware = compose(applyMiddleware(thunk));
const store = createStore(rootReducer, middleware);

export default store;
