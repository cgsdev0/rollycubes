import React from 'react';

interface Props {
  room: string;
}

class Connection extends React.Component<Props> {
  websocket?: WebSocket;

  onClose = (e: CloseEvent) => {
    console.error(e);
    setTimeout(this.openSocket, 5000);
  };

  onOpen = (e: Event) => {
    console.log(e);
    this.websocket!.send("hey")
  };

  onMessage = (e: MessageEvent) => {
    console.log(e);
  };
  openSocket = () => {
    this.websocket = new WebSocket(`ws://localhost:3000/ws/${this.props.room}`);
    this.websocket.addEventListener('close', this.onClose);
    this.websocket.addEventListener('open', this.onOpen);
    this.websocket.addEventListener('message', this.onMessage);
  };
  componentDidMount() {
    this.openSocket();
  }

  componentDidUpdate(prev: Props) {
    if(prev.room !== this.props.room) {
      if(this.websocket) {
        this.websocket.close();
      }
      this.openSocket();
    }
  }
  render() {
    return null;
  }
}

export default Connection;
