import React from "react";
import { connect, DispatchProp } from "react-redux";
import "../App.css";
import { ReduxState } from "../store";
import "../ui/buttons/buttons.css";
import {
  selectIsDarkTheme,
  selectCheats,
  selectIs3d,
} from "../selectors/game_selectors";
import { useKeycloak } from "@react-keycloak/web";

interface Props {
  socket?: WebSocket;
  theme: boolean;
  hints: boolean;
  is3d: boolean;
}

const SettingsMenu: React.FC<Props & DispatchProp> = (props) => {
  const { keycloak } = useKeycloak();
  const loggedIn = Boolean(keycloak && (keycloak as any).authenticated);
  const loggedInAs: string =
    (keycloak &&
      (keycloak as any).idTokenParsed &&
      (keycloak as any).idTokenParsed.preferred_username) ||
    "";

  const [isOpen, setIsOpen] = React.useState(false);

  const changeName = () => {
    const e = window.prompt("Enter a name: ", "");
    if (e === null) return;
    if (props.socket) {
      props.socket.send(JSON.stringify({ type: "update_name", name: e }));
      localStorage.setItem("name", e);
    }
  };

  // register a click handler to close settings
  React.useEffect(() => {
    const closeSettings = (e: any) => {
      if (!e.path.map((el: any) => el.id).includes("settingsBox")) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", closeSettings);
      return () => {
        document.removeEventListener("click", closeSettings);
      };
    }
  }, [isOpen]);

  return (
    <div id="settings">
      <img
        alt="settings"
        src="/gear.png"
        width={24}
        height={24}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen ? (
        <div id="settingsBox">
          <ul>
            <li
              onClick={() => {
                setIsOpen(false);
                changeName();
              }}
            >
              Change name
            </li>
            <li
              onClick={() => {
                props.dispatch({ type: "TOGGLE_THEME" });
              }}
            >
              [{props.theme ? "x" : " "}] Dark mode
            </li>
            <li
              onClick={() => {
                props.dispatch({ type: "CHEATS" });
              }}
            >
              [{props.hints ? "x" : " "}] Hints
            </li>
            <li
              onClick={() => {
                props.dispatch({ type: "TOGGLE_3D" });
              }}
            >
              [{props.is3d ? "x" : " "}] 3D mode<sup>(beta)</sup>
            </li>
            {loggedIn ? (
              <li onClick={(keycloak as any).logout}>Logout ({loggedInAs})</li>
            ) : (
              <li onClick={(keycloak as any).login}>Login</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.socket,
    theme: selectIsDarkTheme(state),
    hints: selectCheats(state),
    is3d: selectIs3d(state),
  };
};

export default connect(mapStateToProps)(SettingsMenu);
