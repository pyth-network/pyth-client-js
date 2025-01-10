# @pythnetwork/client

## A library for reading Pyth accounts on Pythnet

[Pyth](https://pyth.network/) is building a way to deliver a decentralized, cross-chain market of verifiable data from high-quality nodes to any smart contract, anywhere.

This library reads Pythnet (Pyth's app-specific SVM blockchain) data using [@solana/web3.js](https://www.npmjs.com/package/@solana/web3.js) and returns JavaScript-friendly objects.

> ⚠️ **Important Warning**: For most use cases, it is recommended and more user-friendly to use Pyth's off-chain API ([Hermes](https://hermes.pyth.network/docs/)) via the [@pythnetwork/hermes-client](https://www.npmjs.com/package/@pythnetwork/hermes-client) package to get the most up-to-date Pyth prices. Using `@pythnetwork/client` requires a Pythnet RPC connection and exposes many low-level details.

## Installation

### npm

```
$ npm install --save @pythnetwork/client
```

### Yarn

```
$ yarn add @pythnetwork/client
```

## Example Usage

This library lets you consume prices in two different ways: you can either get continuously-streaming price updates via a websocket connection, or send one-off requests every time you want the current price.  

### Streaming updates

The websocket connection provides a subscription model for consuming price updates:

```typescript
const pythConnection = new PythConnection(pythnetWeb3Connection, getPythProgramKeyForCluster(pythnetClusterName))
pythConnection.onPriceChange((product, price) => {
  // sample output:
  // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
  console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`)
})

// Start listening for price change events.
pythConnection.start()
```

The `onPriceChange` callback will be invoked every time a Pyth price gets updated.
This callback gets two arguments:
* `price` contains the official Pyth price and confidence, along with the component prices that were combined to produce this result.
* `product` contains metadata about the price feed, such as the symbol (e.g., "BTC/USD") and the number of decimal points.

See `src/example_ws_usage.ts` for a runnable example of the above usage.
You can run this example with `npm run ws_example`.

You may also register to specific account updates using `connection.onAccountChange` in the solana web3 API, then
use the methods in `index.ts` to parse the on-chain data structures into Javascript-friendly objects.

### Request an update

The request model allows you to send one-off HTTP requests to get the current price without subscribing to ongoing updates:

```typescript
const pythClient = new PythHttpClient(connection, pythPublicKey);
const data = await pythClient.getData();

for (let symbol of data.symbols) {
  const price = data.productPrice.get(symbol)!;
  // Sample output:
  // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
  console.log(`${symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`)
}
```

The `getData` function will fetch all information about every product listed on Pyth.
This includes the current price as well as metadata, such as the base and quote currencies.
See `src/example_http_usage.ts` for a runnable example of the above usage.
You can run this example with `npm run http_example`.

## Releases

In order to release a new version of this library and publish it to npm, follow these steps: 
1. Update `CHANGELOG.md` with a description of the changes in this version.
2. Run `npm version <new version number>`. This command will update the version of the package, tag the branch in git, and push your changes to github.
3. Once your change is merged into `main`, create a release, and a github action will automatically publish a new version of the package to npm.
