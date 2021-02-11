export const rpc_token = process.env.REACT_APP_RPC_TOKEN || 'badb730a7c19420ea4f2aa50476afddd';

export const bequestContractAddresses: {[network: string]: string} = {
    bsc: '0x33B973F1c37755356372315C1eae7505ad96e054',
    rinkeby: '0x67A212EEC9E3048bCAA0450a68Ed9cD7c01Ce4dF',
    bsctest: '0x1B377121434Bc726a76bC0A4E3cDf021fDb02A0b',
};

export const aggregatorContractAddresses: {[network: string]: string} = {
    bsc: '', // Arbitrary address, for testing.
    rinkeby: '0x5C1163Fe686354853474105eDf256C0a847f9878', // This contract is wrong, need to redeploy.
    bsctest: '0x1B377121434Bc726a76bC0A4E3cDf021fDb02A0b', // Arbitrary address, for testing.
};
