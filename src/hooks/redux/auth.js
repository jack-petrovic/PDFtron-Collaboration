import { useDispatch, useSelector } from "react-redux";
import {
  loginAction,
  getAccountAction,
  setToken,
  setAccount,
  logoutAction,
  registerAction,
  setRedirectTo,
} from "../../redux/actions";

export const useAuthState = () => useSelector(({ authReducer }) => authReducer);

export const useLoginAction = () => {
  const dispatch = useDispatch();
  return async (values) => dispatch(loginAction(values));
};

export const useRegisterAction = () => {
  const dispatch = useDispatch();
  return (values) => dispatch(registerAction(values));
};

export const useSetTokenAction = () => {
  const dispatch = useDispatch();
  return (tokens) => dispatch(setToken(tokens));
};

export const useSetAccountAction = () => {
  const dispatch = useDispatch();
  return (account) => dispatch(setAccount(account));
};

export const useGetAccountAction = () => {
  const dispatch = useDispatch();
  return () => dispatch(getAccountAction());
};

export const useLogout = () => {
  const dispatch = useDispatch();
  return () => dispatch(logoutAction());
};

export const useSetRedirectTo = () => {
  const dispatch = useDispatch();
  return (redirectTo) => dispatch(setRedirectTo(redirectTo));
};
