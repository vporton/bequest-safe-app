# Safe Bequest App

App URL:
https://ipfs.com/ipfs/QmRLE5Kkm71zdbrzPwowrew4KfDuHfzHwvznc4dDJGGYRm

WARNING: Deployed only on Binance Smart Chain and Rinkeby.

This app allows to set/change/reset a (future) date after which a "heir" can take control over
your Gnosis Safe smart wallet. It is useful for bequesting your funds.

It allows to bequest to a custom address or to common goods like science and free software.

The app _was_ tested but not audited, **no any warranty is provided, use at your own risk!**
See the `LICENSE` for details.

## TODO

- Widget to enter ETH addresses.
- Bequest ERC-20/721/1155 separately, without giving full control over the wallet.
- Bequest to several recipients.
- Invent something to show the bequest transaction in a human-readable form.

## Getting Started

Install dependencies and start a local dev server.

```
yarn install
cp .env.sample .env
REACT_APP_RPC_TOKEN=<INFURA_KEY> yarn start
```

Then:

- If HTTPS is used (by default enabled)
  - Open your Safe app locally (by default via https://localhost:3000/) and accept the SSL error.
- Go to Safe Multisig web interface
  - [Mainnet](https://app.gnosis-safe.io)
  - [Rinkeby](https://rinkeby.gnosis-safe.io/app)
- Create your test safe
- Go to Apps -> Manage Apps -> Add Custom App
- Paste your localhost URL, default is https://localhost:3000/
- You should see Safe App Starter as a new app
- Develop your app from there
