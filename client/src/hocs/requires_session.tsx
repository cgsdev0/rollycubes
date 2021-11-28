import React from "react";
import { RouteComponentProps } from "react-router";

const RedirectIfNoSession = (history: any) => {
  React.useEffect(() => {
    if (!document.cookie.includes("_session")) {
      history.replace("/", {
        redirect: history.location.pathname
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const RequiresSession = <P extends unknown>(
  C: React.ComponentType<P>
): React.ComponentType<P & RouteComponentProps> => {
  return function(props: P & RouteComponentProps) {
    RedirectIfNoSession(props.history);

    if (!document.cookie.includes("_session")) {
      return null;
    }

    return <C {...props} />;
  };
};
