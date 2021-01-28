import React, { useState } from 'react';
import styled from 'styled-components';
import { Text, TextField, Loader, Title } from '@gnosis.pm/safe-react-components';
// import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import Calendar from "react-calendar";

import 'react-calendar/dist/Calendar.css';

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const App: React.FC = () => {
  // const { sdk, safe } = useSafeAppsSDK();
  const [heir, setHeir] = useState(null);
  const [bequestDate, setBequestDate] = useState(null);

  return (
    <Container>
      <Text color="error" size="md">Contracts were tested, but not fully tested and not audited,. Use at your own risk!
      NO ANY WARRANTY EVEN THE IMPLIED ONE!</Text>
      <Title size="md">Bequest your wallet or funds</Title>
      <Text size="lg">Your funds can be taken by the heir after:</Text>
      <Calendar
        value={bequestDate}
        onChange={date => setBequestDate(date as any)}
        minDate={new Date()}
        defaultView="decade"
      />
      <Text color="error" size="md">(Be sure to update this date periodically to ensure the heir doesn't take funds early!)</Text>
      <TextField
        label="The heir"
        value={(heir !== null ? heir : "") as any}
        onChange={heir => setHeir(heir as any)}
      />
      <Text size="lg">The heir can be a user account or a contract, such as another Gnosis Safe, but there is no software to take a bequest from another smart wallet yet. Surely, it will be available in the future.</Text>
    </Container>
  );
};

export default App;
