import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { theme, Loader, Title, Text, TextField } from '@gnosis.pm/safe-react-components';
import SafeProvider from '@gnosis.pm/safe-apps-react-sdk';

import GlobalStyle from './GlobalStyle';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SafeProvider
        loader={
          <>
            <Text color="error" size="md">Contracts were tested, but not fully tested and not audited,. Use at your own risk!
            NO ANY WARRANTY EVEN THE IMPLIED ONE!</Text>
            <Title size="md">Bequest your wallet or funds</Title>
            <Text size="lg">Your funds can be taken by the heir after:</Text>
            <Text color="error" size="md">(Be sure to update this date periodically to ensure the heir doesn't take funds early!)</Text>
            <TextField
              label="The heir"
              value=""
            />
            <Text size="lg">The heir can be a user account or a contract, such as another Gnosis Safe, but there is no software to take a bequest from another smart wallet yet. Surely, it will be available in the future.</Text>
            <Loader size="md" />
          </>
        }
      >
        <App />
      </SafeProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
