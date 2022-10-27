import React from "react";
import { useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";

const RequiresSessionWrapper = (props: { children: any }) => {
  const location = useLocation();
  if (!document.cookie.includes("_session")) {
    return (
      <Navigate to="/" replace={true} state={{ redirect: location.pathname }} />
    );
  }
  return <>{props.children}</>;
};

export const RequiresSession = <P extends object>(
  C: React.ComponentType<P>
): React.ComponentType<P> => {
  return function (props: P) {
    return (
      // <RequiresSessionWrapper>
        <C {...props} />
      // </RequiresSessionWrapper>
    );
  };
};
