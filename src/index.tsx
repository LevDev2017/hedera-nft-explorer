import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from "react-redux";
import CssBaseline from '@mui/material/CssBaseline';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './theme';
import { store } from './store';
import { Buffer } from 'buffer';
import { HashConnectClient } from './components/hashconnect/hashconnect-client';

window.Buffer = window.Buffer || Buffer;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashConnectClient />
      <ThemeProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
