import React from "react";
import { History } from "history";
import { connect, DispatchProp } from "react-redux";
import { ReduxState } from "./store";
import jwt_decode from "jwt-decode";

interface Props {
  room: string;
  mode: string;
  history: History;
  authToken?: string | null;
}

export interface DecodedUserJWT {
  display_name: string;
  exp: number;
  iat: number;
  user_id: string;
}

class Connection extends React.Component<Props & DispatchProp> {
  websocket?: WebSocket;
  timer?: any;

  onClose = (_: CloseEvent) => {
    console.error("Socket closed, reconnecting...");
    this.props.dispatch({ type: "socket_close" });
    this.timer = setTimeout(this.openSocket, 5000);
  };

  onOpen = (_: Event) => {
    console.log("Socket opened to room", this.props.room);
    this.props.dispatch({ type: "socket_open" });
    const name = localStorage.getItem("name");
    if (this.websocket && this.props.authToken) {
      // test
      this.websocket.send(
        JSON.stringify({
          type: "authenticate",
          access_token: this.props.authToken
        })
      );
    } else if (this.websocket && name) {
      this.websocket.send(JSON.stringify({ type: "update_name", name }));
    }
    //this.websocket!.send(JSON.stringify({ type: "roll", n: 0, msg: "Hello world!" }))
  };

  onMessage = (e: MessageEvent) => {
    const data: any = JSON.parse(e.data);
    if (!data) {
      console.error("empty action from server");
    } else if ("error" in data) {
      if (data.error === "already connected") {
        if (this.websocket) this.websocket.close();
        this.props.history.replace(`/multiple-tabs`);
      }
      console.error(data || data.error);
    } else if (data.type === "redirect") {
      const pathParts = this.props.history.location.pathname.split("/");
      this.props.history.replace(`/${pathParts[1]}/${data.room}`);
    } else {
      // I'm sorry
      const otherUsers = (window as any).REDUX_STORE.getState().otherUsers;
      const {
        authServiceOrigin
      } = (window as any).REDUX_STORE.getState().settings;
      const populateUser = (player: any) => {
        if (player.hasOwnProperty("user_id")) {
          if (!otherUsers.hasOwnProperty(player.user_id)) {
            (async () => {
              try {
                const resp = await window.fetch(
                  authServiceOrigin + "users/" + player.user_id
                );
                const data = await resp.json();
                if (!data.hasOwnProperty("id")) {
                  console.error("failed to get user info for", player.user_id);
                  return;
                }
                this.props.dispatch({ type: "GOT_USER_DATA", data });
              } catch (e) {
                console.error("Something went wrong fetching user data", e);
              }
            })();
          }
        }
      };
      if (data.type === "welcome") {
        data.game.players.forEach(populateUser);
      }
      if (data.type === "join") {
        populateUser(data);
      }
      this.props.dispatch(data);
    }
  };

  onError = (e: any) => {
    console.error("oh god why", e);
  };
  openSocket = () => {
    if (
      !this.websocket ||
      this.websocket.readyState === WebSocket.CLOSED ||
      this.websocket.readyState === WebSocket.CLOSING
    ) {
      let portString = "";
      if (window.location.port !== "80") {
        portString = `:${window.location.port}`;
      }
      let userIdStr = "";
      if (this.props.authToken) {
        const decoded: DecodedUserJWT = jwt_decode(this.props.authToken);
        userIdStr = "?userId=" + decoded.user_id;
      }
      this.websocket = new WebSocket(
        `${window.location.protocol.endsWith("s:") ? "wss" : "ws"}://${
          window.location.hostname
        }${portString}/ws/${this.props.mode}/${this.props.room}${userIdStr}`
      );
      this.websocket.addEventListener("close", this.onClose);
      this.websocket.addEventListener("open", this.onOpen);
      this.websocket.addEventListener("message", this.onMessage);
      this.websocket.addEventListener("error", this.onError);
      this.props.dispatch({ type: "WEBSOCKET", socket: this.websocket });
    }
  };

  componentDidMount() {
    this.openSocket();
  }

  componentDidUpdate(prev: Props) {
    if (prev.room !== this.props.room) {
      if (this.websocket) {
        this.websocket.close();
      }
      this.openSocket();
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: "WEBSOCKET", socket: undefined });
    if (this.websocket) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.websocket.removeEventListener("close", this.onClose);
      this.websocket.removeEventListener("open", this.onOpen);
      this.websocket.removeEventListener("message", this.onMessage);
      this.websocket.close();
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state: ReduxState) => {
  return {
    authToken: state.authToken
  };
};
export default connect(mapStateToProps)(Connection);
