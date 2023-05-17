import { useGetRefreshTokenQuery } from 'api/auth';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from 'store';

export const AuthProvider: React.FC<{}> = ({ children }) => {
  const { isLoading, data, error } = useGetRefreshTokenQuery();
  const dispatch = useDispatch();
  const loaded = useSelector<ReduxState>(
    (state) => state.auth.authToken !== undefined
  );

  React.useEffect(() => {
    if (isLoading) return;
    if (error) {
      dispatch({ type: 'AUTHENTICATE', access_token: null });
    } else if (data) {
      dispatch({ type: 'AUTHENTICATE', access_token: data.access_token });
    }
  }, [isLoading, data, error]);

  if (!loaded) return null;
  return <>{children}</>;
};
