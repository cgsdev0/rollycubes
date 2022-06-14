import React, { FormEvent } from "react";
import { ReduxState } from "../store";
import { connect, DispatchProp } from "react-redux";
import Linkify from "react-linkify";
import { selectIsSpectator } from "../selectors/game_selectors";

interface Props {
  socket?: WebSocket;
  chat: string[];
  isSpectator: boolean;
}

const helpString = `--------------------HELP--------------------
/name [string] - change your username
/hints - toggle gameplay hints
/3d - 3D dice! [EXPERIMENTAL]
----------------------------------------------
`;

const ChatBox: React.FC<Props & DispatchProp> = (props) => {
  const [chatMsg, setChatMsg] = React.useState("");

  const sendChat = (e: FormEvent) => {
    if (props.socket) {
      if (chatMsg) {
        switch (chatMsg.toLowerCase().split(" ")[0]) {
          case "/help":
            helpString
              .split("\n")
              .forEach((msg) => props.dispatch({ type: "chat", msg }));
            break;
          case "/name":
          case "/username":
          case "/n":
          case "/u":
            const name = chatMsg.split(" ").slice(1).join(" ");
            props.socket.send(JSON.stringify({ type: "update_name", name }));
            localStorage.setItem("name", name);
            break;
          case "/hints":
          case "/hint":
          case "/cheat":
          case "/cheats":
          case "/guide":
            props.dispatch({ type: "CHEATS" });
            break;
          case "/3d":
            props.dispatch({ type: "TOGGLE_3D" });
            break;
          default:
            props.socket.send(JSON.stringify({ type: "chat", msg: chatMsg }));
        }
        setChatMsg("");
      }
    }
    e.preventDefault();
  };

  return (
    <React.Fragment>
      <form onSubmit={sendChat}>
        <input
          value={chatMsg}
          onChange={(e) => {
            setChatMsg(e.target.value);
          }}
          maxLength={400}
          placeholder="Type a message..."
          disabled={props.isSpectator}
        ></input>
        <button type="submit" disabled={props.isSpectator}>
          Send
        </button>
      </form>
      <div className="Messages">
        {props.chat.map((msg, i) => (
          <React.Fragment key={i}>
            <ChatMsg msg={msg} />
          </React.Fragment>
        ))}
      </div>
    </React.Fragment>
  );
};

const LinkDecorator = (
  decoratedHref: string,
  decoratedText: string,
  key: number
) => {
  return (
    <a href={decoratedHref} target="_blank" key={key} rel="noreferrer">
      {decoratedText}
    </a>
  );
};

const ChatMsg = (props: { msg: string }) => {
  return (
    <Linkify componentDecorator={LinkDecorator}>
      <p>{props.msg}</p>
    </Linkify>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    chat: state.chat.chat,
    isSpectator: selectIsSpectator(state),
  };
};

export default connect(mapStateToProps)(ChatBox);
