import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import logo from './logo.svg';
import Connection from './connection';


interface Props { }
interface State {
}
class App extends React.Component<Props, State> {

  render() {
    return (
      <Router>

        <div className="App">
          <Route path="/room/:room" render={(a: any) => (<Connection room={a.match.params.room} history={a.history} />)} />
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
          </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer">
              Learn React
          </a>
          </header>
        </div>
      </Router>
    );
  }
}

export default App;
