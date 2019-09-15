import React from 'react';
import logo from './logo.svg';
import './App.css';
import Connection from './connection';

interface Props {}
interface State {
  hasCookie: boolean;
  room?: string;
}
class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasCookie: false};
  }
  pressButton = async () => {
    const result = await window.fetch(`${window.location.origin}/create`);
    const text = await result.text();
    this.setState({room: text});
  };
  async componentDidMount() {
    if (document.cookie.includes('_session=')) {
      this.setState({hasCookie: true});
    } else {
      const result = await window.fetch(`${window.location.origin}/cookie`);
      if (result.ok) {
        this.setState({hasCookie: true});
      } else {
        console.error("I wasn't able to get a cookie!");
      }
    }
  }
  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.room !== this.state.room) {
      window.history.pushState(
        {room: this.state.room},
        'Dice Game',
        `/room/${this.state.room}`,
      );
    }
  }
  render() {
    return (
      <div className="App">
        {this.state.room ? <Connection room={this.state.room} /> : null}
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          {this.state.hasCookie && !this.state.room ? (
            <button onClick={this.pressButton} value="create room">
              Start
            </button>
          ) : null}
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer">
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
