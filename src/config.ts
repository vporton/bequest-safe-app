export const rpc_token = process.env.REACT_APP_RPC_TOKEN || '';

export const bequestContractAddresses: {[network: string]: string} = {
    rinkeby: '0x67A212EEC9E3048bCAA0450a68Ed9cD7c01Ce4dF',
};

export const aggregatorContractAddresses: {[network: string]: string} = {
    rinkeby: '0x5C1163Fe686354853474105eDf256C0a847f9878', // This contract is wrong, need to redeploy.
};
