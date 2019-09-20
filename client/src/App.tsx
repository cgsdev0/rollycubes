import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import GamePage from './pages/game_page';
import { store } from './store';
import HomePage from './pages/home_page';
import CookiePage from './pages/cookie_page';


interface Props { 

}

interface State {

}

class App extends React.Component<Props, State> {

  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Route path="/" exact component={CookiePage} />
            <Route path="/home" component={HomePage} />
            <Route path="/room/:room" component={GamePage} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
