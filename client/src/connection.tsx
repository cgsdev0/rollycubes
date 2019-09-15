import React from 'react';
import { History } from 'history';

interface Props {
  room: string;
  history: History;
}

class Connection extends React.Component<Props> {
  websocket?: WebSocket;
  timer?: any;

  onClose = (e: CloseEvent) => {
    console.error(e);
    this.timer = setTimeout(this.openSocket, 5000);
  };

  onOpen = (e: Event) => {
    console.log(e);
    this.websocket!.send(JSON.stringify({ type: "roll", n: 0, msg: "Hello world!" }))
  };

  onMessage = (e: MessageEvent) => {
    const data: any = JSON.parse(e.data);
    console.log(data);
    if (!data) {
      console.error("empty action from server")
    }
    else if(Object.keys(data).find(k => k === "error")) {
      console.error(data.error);
    }
    else if (data.type === "redirect") {
      this.props.history.replace(`/room/${data.room}`)
    }
  };

  openSocket = () => {
    if (!this.websocket || this.websocket.readyState === WebSocket.CLOSED || this.websocket.readyState === WebSocket.CLOSING) {
      this.websocket = new WebSocket(`ws://${window.location.hostname}:3000/ws/${this.props.room}`);
      this.websocket.addEventListener('close', this.onClose);
      this.websocket.addEventListener('open', this.onOpen);
      this.websocket.addEventListener('message', this.onMessage);
    }
  };

  componentDidMount() {
    console.log(this.props)
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
    if (this.websocket) {
      if(this.timer) {
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

export default Connection;
