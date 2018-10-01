// IE compatibility
import '@babel/polyfill';

// Styles
import './styles.css';

import React from 'react';
import {render} from 'react-dom';

import App from './App';

const rootElement = document.getElementById('root');
render(<App />, rootElement);
