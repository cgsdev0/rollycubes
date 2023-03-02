import { cheatsAction } from "actions/settings";
import React, { FormEvent } from "react";
import Linkify from "react-linkify";
import { connect, DispatchProp } from "react-redux";
import { css, styled } from "stitches.config";
import { selectIsSpectator } from "../selectors/game_selectors";
import { ReduxState } from "../store";

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

const ChatBar = styled("input", {
  width: "calc(100% - 26px)",
  fontFamily: "Amiko",
  fontSize: 18,
  marginTop: 8,
  borderRadius: 6,
  backgroundColor: "$gray700",
  color: "$primary",
  "&:focus": {
    outline: "none",
  },
  border: 0,
  padding: 10,
  paddingLeft: 16,
});

const ChatWrapper = styled("div", {
  overflow: "hidden",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  a: {
    textDecoration: "none",
    textTransform: "none",
    color: "$brand",
    fontSize: "inherit",
    letterSpacing: "inherit",
  },
  "a:hover": {
    fontSize: "inherit",
    textDecoration: "underline",
    color: "$primaryDimmed",
  },
});

const MessageBox = styled("div", {
  overflowX: "hidden",
  userSelect: "text",
  overflowWrap: "anywhere",
  overflowY: "scroll",
  width: "calc(100% - 16px)",
  height: "100%",
  paddingRight: 16,
  "&::-webkit-scrollbar": {
    width: "6px",
  },

  "&::-webkit-scrollbar-track": {
    background: "#232323",
    borderRadius: 6,
  },

  /* Handle */
  "&::-webkit-scrollbar-thumb": {
    background: "$gray500",
  },

  /* Handle on hover */
  "&::-webkit-scrollbar-thumb:hover": {
    background: "$gray600",
  },
});

const ChatBox: React.FC<Props & DispatchProp> = (props) => {
  const [chatMsg, setChatMsg] = React.useState("");

  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bottomRef, props.chat]);

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
            props.dispatch(cheatsAction());
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
    <ChatWrapper>
      <MessageBox>
        {props.chat
          .slice()
          .reverse()
          .map((msg, i) => (
            <ChatMsg msg={msg} key={i} />
          ))}
        <div ref={bottomRef}></div>
      </MessageBox>
      <form onSubmit={sendChat}>
        <ChatBar
          value={chatMsg}
          onChange={(e) => {
            setChatMsg(e.target.value);
          }}
          maxLength={400}
          placeholder="Type a message..."
          disabled={props.isSpectator}
        ></ChatBar>
      </form>
    </ChatWrapper>
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
