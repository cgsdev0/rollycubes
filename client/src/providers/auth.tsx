import { useGetRefreshTokenQuery } from "api/auth";
import React from "react";
import { useDispatch } from "react-redux";

export const AuthProvider: React.FC<{}> = ({ children }) => {
  const { isLoading, data, error } = useGetRefreshTokenQuery();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (isLoading) return;
    if (error) {
      dispatch({ type: "AUTHENTICATE", access_token: null });
    } else if (data) {
      dispatch({ type: "AUTHENTICATE", access_token: data.access_token });
    }
  }, [isLoading, data, error]);

  if (isLoading) return null;
  return <>{children}</>;
};
