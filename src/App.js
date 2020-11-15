import React from 'react';
import './App.css';
import BugsList from './components/BugsList'
import Bugs from './components/Bugs'

import configStore from './store/configStore';
import {Provider} from 'react-redux';

const store = configStore();

function App() {
  return (
    <Provider store={store}>
      <BugsList></BugsList>
    </Provider>
  );
}

export default App;
