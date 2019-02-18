import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'normalize.css';

import * as serviceWorker from './serviceWorker';
import App from './components/App';
import Home from './components/Home';
import Team from './components/Team';
import Teams from './components/Teams';
import Events from './components/Events';
import Skills from './components/Skills';

const Routes = (
  <Router>
    <App>
      <Route path="/" exact component={Home} />
      <Route path="/teams" exact component={Teams} />
      <Route path="/events" exact component={Events} />
      <Route path="/skills" exact component={Skills} />
      <Route path="/teams/:program/:id" exact component={Team} />
    </App>
  </Router>
);

ReactDOM.render(Routes, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
