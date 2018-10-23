import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue, red } from '@material-ui/core/colors';
import App from './components/App';
import Home from './components/Home';
import Teams from './components/Teams';
import Events from './components/Events';
import Skills from './components/Skills';
//import registerServiceWorker from './registerServiceWorker';
import { unregister } from './registerServiceWorker';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: red
  },
  overrides: {
    MuiToolbar: {
      dense: {
        paddingLeft: '16px',
        paddingRight: '16px'
      }
    }
  }
});

const Routes = (
  <Router>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App theme={theme}>
        <Route exact path="/" component={Home} />
        <Route exact path="/teams" component={Teams} />
        <Route exact path="/events" component={Events} />
        <Route exact path="/skills" component={Skills} />
      </App>
    </MuiThemeProvider>
  </Router>
);

ReactDOM.render(Routes, document.getElementById('root'));
unregister();  //registerServiceWorker();
