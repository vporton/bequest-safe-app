import Web3 from 'web3';
import {AbiItem} from 'web3-utils';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Text, TextField, Button, Title, EtherscanButton, Loader } from '@gnosis.pm/safe-react-components';
import { useSafe } from '@rmeissner/safe-apps-react-sdk';
import Calendar from "react-calendar";

import 'react-calendar/dist/Calendar.css';
import 'react-tabs/style/react-tabs.css';

import { rpc_token, bequestContractAddresses, aggregatorContractAddresses } from './config';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

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
  const [web3, setWeb3] = useState<Web3 | undefined>();
  const [networkNotSupported, setNetworkNotSupported] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [aggregatorContractAddress, setAggregatorContractAddress] = useState<string | null>(null);
  const [bequestModuleAbi, setBequestModuleAbi] = useState<AbiItem[] | undefined>();
  const [originalHeir, setOriginalHeir] = useState('');
  const [originalBequestDate, setOriginalBequestDate] = useState<Date | null>(null);
  const [heir, setHeir] = useState('');
  const [bequestDate, setBequestDate] = useState<Date | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  
  const safe = useSafe();

  function updateWeb3() {
    setLoaded(false);
    let rpcUrl;
    switch(safe.info.network.toLowerCase()) {
      case 'bsc':
        rpcUrl = `https://bsc-dataseed.binance.org/`;
        break;
      case 'xdai':
        rpcUrl = `https://dai.poa.network/`;
        break;
      default:
        rpcUrl = `https://${safe.info.network}.infura.io/v3/${rpc_token}`;
    }
    const web3Instance =  new Web3(rpcUrl);
    setWeb3(web3Instance);
    console.log('setweb3')
  }

  useEffect(() => {
    updateWeb3()
  }, [safe.info.network]);

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

  const fetchBequestInfo = async () => {
    if (!web3 || !bequestModuleAbi || !safe.info.safeAddress) {
      return;
    }

    console.log("Fetching bequest information...");
    try {
      const _aggregatorContractAddress = aggregatorContractAddresses
        ? aggregatorContractAddresses[safe.info.network.toLowerCase() as any] as string
        : null;
      setAggregatorContractAddress(_aggregatorContractAddress);
      const bequestContractAddress = bequestContractAddresses[safe.info.network.toLowerCase()];
      setNetworkNotSupported(bequestContractAddress === undefined); // FIXME
      if (networkNotSupported) {
        return;
      }

      const bequestContract = new web3.eth.Contract(bequestModuleAbi, bequestContractAddress);
      // FIXME: The following is called two times:
      const [_heir, _bequestDate] =
        await Promise.all([
          bequestContract.methods.heirs(safe.info.safeAddress).call(),
          bequestContract.methods.bequestDates(safe.info.safeAddress).call(),
        ]);
      setOriginalHeir(_heir);
      const date = _bequestDate !== 0 ? new Date(_bequestDate * 1000) : new Date(); // FIXME
      setOriginalBequestDate(date);
      setHeir(originalHeir);
      setBequestDate(date);
      setTabIndex(_heir === NULL_ADDRESS || _heir === aggregatorContractAddress ? 0 : 1); // TODO: Use symbolic contants.
      setLoaded(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBequestInfo();
  }, [bequestModuleAbi, web3, networkNotSupported, safe.info.safeAddress, safe.info.network]); // TODO: Simplify.

  function setBequest(heir: string, bequestDate: Date) {
    if (!bequestDate || bequestDate.getTime() === 0) {
      alert("This app has zero bequest date bug! I'm doing nothing for your safety.");
      return;
    }

    setBequestUnsafe(heir, bequestDate);
  }

  function setBequestUnsafe(heir: string, bequestDate: Date) {
    const bequestContractAddress = bequestContractAddresses[safe.info.network.toLowerCase()]; // duplicate code
    const bequestContract = new (web3 as any).eth.Contract(bequestModuleAbi, bequestContractAddress);
    const txs = [
      {
        to: bequestContractAddress,
        value: 0,
        data: bequestContract.methods.setBequest(heir, bequestDate.getTime() / 1000).encodeABI(),
      },
    ];
    async function doIt() {
      try {
        await (await safe.sendTransactions(txs as any));
      } catch (err) {
        console.error(err.message);
      }
    }
    doIt();
  }

  function realHeir() {
    try {
      return tabIndex === 0
        ? aggregatorContractAddress
        : (heir ? (web3 as any).utils.toChecksumAddress(heir) : '');
    }
    catch(_) {
      return NULL_ADDRESS;
    }
  }

  return (
    <Container>
      <Title size="md">Bequest your wallet or funds</Title>
      <Text color="error" size="md">Contracts were tested, but not audited. Use at your own risk!
      NO ANY WARRANTY EVEN THE IMPLIED ONE! BY USING THIS APP YOU AGREE FOR NO COMPENSATION FOR ANY LOSS
      BECAUSE OF ANY ERRORS IN THE APP OR ASSOCIATED SMART CONTRACTS OR ANY OTHER SOFTWARE FAILURES!</Text>
      <div style={{display: networkNotSupported ? 'block' : 'none'}}>
        <Text color="error" size="lg">
          This Ethereum network ({safe.info.network}) is not supported.
        </Text>
      </div>
      <div style={{display: loaded ? 'none' : 'block'}}>
        <Loader size="md"/>
      </div>
      <div style={{display: loaded ? 'block' : 'none'}}>
        <p>
          <span>Current heir:</span>
          {' '}
          <span style={{display: originalHeir && !/^0x0+$/.test(originalHeir) ? 'inline' : 'none'}}>
            <span style={{display: originalHeir !== aggregatorContractAddress ? 'inline' : 'none'}}>
              {originalHeir}
              {' '}
              <EtherscanButton value={originalHeir} network={safe.info.network}/>
            </span>
            <span style={{display: originalHeir === aggregatorContractAddress ? 'inline' : 'none'}}>
              <em>(science, software, and other common goods)</em>
            </span>
            <br/> 
            Can be taken after: {originalBequestDate ? String(originalBequestDate) : ""}
          </span>
          {' '}
          <span style={{display: originalHeir && !/^0x0+$/.test(originalHeir) ? 'none' : 'inline'}}>
            <em>(none)</em>
          </span>
        </p>
        <Text size="lg">Allow to take your funds by the heir after:
          {' '}
          {bequestDate !== null && ((heir && !/^0x0+$/.test(heir)) || bequestDate.getTime() !== 0) ? String(bequestDate) : ""}
        </Text>
        <Calendar
          value={bequestDate}
          onChange={date => setBequestDate(date as any)}
          minDate={new Date()}
          defaultView={(bequestDate === null) ? 'decade' : undefined} // TODO: It does not work.
        />
        <Text color="error" size="lg">(Be sure to update this date periodically to ensure the heir doesn't take funds early!)</Text>
        <Text size="lg">Heir:</Text>
        <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
          <TabList>
            <Tab>Science, free software, common gooods</Tab>
            <Tab>Custom address</Tab>
          </TabList>
          <TabPanel>
            <Text size="md">
              Your bequest will be automatically delivered to best scientists,
              {' '}
              software developers, open access publishers, carbon accounters, and other common goods,
              {' '}
              selected by software and free market.
            </Text>
            <Text size="md">
              We use a mathematical operation similar to money transfer from the future
              {' '}
              (Think about prediction markets and credits.)
              {' '}
              for them to get money before your bequest is withdrawn.
            </Text>
            <Text size="md">
              See <a rel="noopener noreferrer" target="_blank" href="https://vporton.github.io/future-salary/">Future Salaries</a> about how money is used.
            </Text>
            <Text size="md" color="error">
              Currenly common good bequests work only on xDai network.
            </Text>
          </TabPanel>
          <TabPanel>
            {/* TODO: Special widget to inpout Ethereum addresses. */}
            <TextField
              label="The heir"
              value={heir}
              onChange={(e: any) => setHeir(e.target.value)}
            />
            <Text size="lg">
              The heir can be a user account or a contract, such as another Gnosis Safe.<br/>
              There is no software to take a bequest, yet. Surely, it will be available in the future.</Text>
          </TabPanel>
        </Tabs>
        <p>
          <Button
            style={{display: realHeir() !== '' && !/^0x0+$/.test(realHeir()) && bequestDate && bequestDate.getTime() !== 0 ? 'inline' : 'none'}}
            size="md"
            color="primary"
            variant="contained"
            onClick={(e: any) => setBequest(realHeir(), (bequestDate as Date))}
          >
            Set bequest date and heir!
          </Button>
          {' '}
          <Button
            //style={{display: heir === null || /^0x0+$/.test(heir) ? 'none' : 'inline'}}
            size="md"
            color="primary"
            variant="contained"
            onClick={(e: any) => setBequestUnsafe(NULL_ADDRESS, new Date(0))}
          >
            Cancel bequest!
          </Button>
        </p>
      </div>
      <Text size="sm"><a target="_blank" rel="noopener noreferrer" href="https://github.com/vporton/bequest-safe-app">App source code</a></Text>
    </Container>
  );
};

export default App;
