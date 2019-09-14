import React from 'react';

class Connection extends React.Component {
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
    this.websocket = new WebSocket("ws://localhost:3000/ws");
    this.websocket.addEventListener('close', this.onClose);
    this.websocket.addEventListener('open', this.onOpen);
    this.websocket.addEventListener('message', this.onMessage);
  };
  componentDidMount() {
    this.openSocket();
  }
  render() {
    return null;
  }
}

export default Connection;
