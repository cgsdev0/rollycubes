import React from "react";
import { RouteComponentProps } from "react-router-dom";

interface TParams {
  room: string;
}
interface Props {
  route: RouteComponentProps<TParams>;
}

const waitFor = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

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
      if (document.cookie.includes("_session")) {
        redirect.current();
      } else {
        let result = await window.fetch("/cookie");
        while (!result || !result.ok) {
          await waitFor(1000);
          result = await window.fetch("/cookie");
        }
        redirect.current();
      }
    })();
  }, []);

  return null;
};

export default (a: RouteComponentProps<TParams>) => <CookiePage route={a} />;
