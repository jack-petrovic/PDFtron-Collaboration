import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useAuthState,
  useSetTokenAction,
  useSetAccountAction,
  useSetRedirectTo,
} from "../../hooks/redux";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../constants";
import { AuthService } from "../../services";

const AuthProvider = ({ children }) => {
  const { tokens, account } = useAuthState();
  const setTokens = useSetTokenAction();
  const setAccount = useSetAccountAction();
  const setRedirectTo = useSetRedirectTo();
  const location = useLocation();

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
      setTokens({
        accessToken,
        refreshToken,
      });
    } else {
      setAccount(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tokens === undefined || !tokens?.accessToken || !tokens?.refreshToken) {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

    if (!account) {
      AuthService.getAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, account]);

  useEffect(() => {
    if (!account && location.pathname !== "/login") {
      setRedirectTo(location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return <React.Fragment>{children}</React.Fragment>;
};

export default AuthProvider;
