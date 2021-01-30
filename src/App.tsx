import Web3 from 'web3';
import {AbiItem} from 'web3-utils';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Text, TextField, Button, Title, Loader } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import Calendar from "react-calendar";

import 'react-calendar/dist/Calendar.css';

import { rpc_token, bequestContractAddresses } from './config';

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
  const { sdk: appsSdk, safe: safeInfo, connected } = useSafeAppsSDK();

  const [web3, setWeb3] = useState<Web3 | undefined>();
  const [networkNotSupported, setNetworkNotSupported] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [bequestModuleAbi, setBequestModuleAbi] = useState<AbiItem[] | undefined>();
  const [heir, setHeir] = useState<string | null>(null);
  const [bequestDate, setBequestDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!safeInfo) {
      return;
    }

    setLoaded(false);
    const web3Instance = new Web3(`https://${safeInfo.network}.infura.io/v3/${rpc_token}`);
    setWeb3(web3Instance);
  }, [safeInfo]);

  useEffect(() => {
    if (!web3) {
      return;
    }

    async function doIt() {
      try {
        const abi = await fetch("./abi/BequestModule.json");
        setBequestModuleAbi(await abi.json());
      } catch (err) {
        console.error(err);
      }
    }
    doIt();
  }, [web3]);

  useEffect(() => {
    if (!web3 || !bequestModuleAbi) {
      return;
    }

    const fetchBequestInfo = async () => {
      try {
        const bequestContractAddress = bequestContractAddresses[safeInfo.network.toLowerCase()];
        setNetworkNotSupported(bequestContractAddress === undefined);
        if (networkNotSupported) {
          return;
        }

        const bequestContract = new web3.eth.Contract(bequestModuleAbi, bequestContractAddress);
        // FIXME: The following is called two times:
        const [_heir, _bequestDate] =
          await Promise.all([
            bequestContract.methods.heirs(safeInfo.safeAddress).call(),
            bequestContract.methods.bequestDates(safeInfo.safeAddress).call(),
          ]);
        setHeir(/^0x0+$/.test(_heir) ? "" : _heir);
        setBequestDate(_bequestDate !== 0 ? new Date(_bequestDate * 1000) : new Date()); // FIXME
        setLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBequestInfo();
  }, [web3, safeInfo.safeAddress, bequestModuleAbi]);

  return (
    <Container>
      <Title size="md">Bequest your wallet or funds</Title>
      <Text color="error" size="md">Contracts were tested, but not audited. Use at your own risk!
      NO ANY WARRANTY EVEN THE IMPLIED ONE! BY USING THIS APP YOU AGREE FOR NO COMPENSATION FOR ANY LOSS
      BECAUSE OF ANY ERRORS IN THE APP OR ASSOCIATED SMART CONTRACTS OR ANY OTHER SOFTWARE FAILURES!</Text>
      <div style={{display: networkNotSupported ? 'block' : 'none'}}>
        <Text color="error" size="lg">
          This Ethereum network ({safeInfo.network}) is not supported.
        </Text>
      </div>
      <div style={{display: loaded ? 'none' : 'block'}}>
        <Loader size="md"/>
      </div>
        <div style={{display: loaded ? 'block' : 'none'}}>
        <Text size="lg">Your funds can be taken by the heir after:
          {' '}
          {bequestDate !== null && (heir || bequestDate.getTime() !== 0) ? bequestDate.toLocaleString() : ""}</Text>
        <Calendar
          value={bequestDate}
          onChange={date => setBequestDate(date as any)}
          minDate={new Date()}
          defaultView={bequestDate === null ? 'decade' : undefined}
        />
        <Text color="error" size="lg">(Be sure to update this date periodically to ensure the heir doesn't take funds early!)</Text>
        <TextField
          label="The heir"
          value={(heir !== null ? heir : "") as any}
          onChange={heir => setHeir(heir as any)}
        />
        <Text size="lg">
          The heir can be a user account or a contract, such as another Gnosis Safe.<br/>
          There is no software to take a bequest, yet. Surely, it will be available in the future.</Text>
        <p>
          <Button size="md" color="primary" variant="contained">Set bequest date and heir!</Button>
          {' '}
          <Button style={{display: heir === null || /^0x0+$/.test(heir as string) ? 'inline' : 'none'}} size="md" color="primary" variant="contained">Cancel bequest!</Button>
        </p>
      </div>
      <Text size="sm"><a target="_blank" rel="noreferrer" href="https://github.com/vporton/bequest-safe-app">App source code</a></Text>
    </Container>
  );
};

export default App;
