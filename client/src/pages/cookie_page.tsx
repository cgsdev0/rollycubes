import React from "react";
import { v4 as uuidv4 } from "uuid";
import { RouteComponentProps } from "react-router-dom";

interface TParams {
  room: string;
}
interface Props {
  route: RouteComponentProps<TParams>;
}

const CookiePage: React.FC<Props> = ({ route }) => {
  const redirect = React.useRef(() => {
    const state = route.history.location.state as any;
    if (state && state.redirect) {
      route.history.replace(state.redirect);
    } else {
      route.history.replace("/home");
    }
  });
  React.useEffect(() => {
    (async () => {
      if (!document.cookie.includes("_session")) {
        document.cookie = `_session=${uuidv4()}`;
        redirect.current();
      } else {
        redirect.current();
      }
    })();
  }, []);

  return null;
};

export default (a: RouteComponentProps<TParams>) => <CookiePage route={a} />;
