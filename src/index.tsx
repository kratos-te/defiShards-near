import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from "@chakra-ui/react";
import theme from './theme';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { InitNearContext, NearContext } from "./hooks/Near";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
InitNearContext().then((nearContext) => {
  root.render(
    <React.StrictMode>
      <ChakraProvider theme={theme} >
        <NearContext.Provider value={nearContext}>
          <App />
        </NearContext.Provider>
      </ChakraProvider>
    </React.StrictMode>
  )
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
