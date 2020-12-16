import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import GamePage from './pages/game_page';
import {store} from './store';
import HomePage from './pages/home_page';
import CookiePage from './pages/cookie_page';
import {connect} from 'react-redux';
import {ReduxState} from './store';
import {ThemeContext} from './themes';

interface Props {}

interface State {}

const mapStateToProps = (state: ReduxState) => {
  return {
    theme: state.settings.theme,
  };
};

const AppThemer = connect(mapStateToProps)(({theme}) => {
  return (
    <ThemeContext.Provider value={theme}>
      <AppInner />
    </ThemeContext.Provider>
  );
});

const App = () => {
  return (
    <Provider store={store}>
      <AppThemer />
    </Provider>
  );
};

const AppInner = () => {
  const theme = React.useContext(ThemeContext);
  return (
    <Router>
      <div className="App" style={theme.app}>
        <Route path="/" exact component={CookiePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/room/:room" component={GamePage} />
      </div>
    </Router>
  );
};

export default App;
