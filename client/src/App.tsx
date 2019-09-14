import React from 'react';
import logo from './logo.svg';
import './App.css';
import Connection from './connection';

const App: React.FC = () => {
  return (
    <div className="App">
      <Connection />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
          {document.cookie}
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
  );
};

export default App;
