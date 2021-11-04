# @pythnetwork/client

## A library for reading on-chain Pyth oracle data

[Pyth](https://pyth.network/) is building a way to deliver a decentralized, cross-chain market of verifiable data from high-quality nodes to any smart contract, anywhere.

This library reads on-chain Pyth data from [@solana/web3.js](https://www.npmjs.com/package/@solana/web3.js) and returns JavaScript-friendly objects.

See our [examples repo](https://github.com/pyth-network/pyth-examples) for real-world usage examples.

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

This library provides a subscription model for consuming price updates:

```javascript
const pythConnection = new PythConnection(solanaWeb3Connection, getPythProgramKeyForCluster(solanaClusterName))
pythConnection.onPriceChange((product, price) => {
  // sample output:
  // SRM/USD: $8.68725 ±$0.0131
  console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence}`)
})

// Start listening for price change events.
pythConnection.start()
```

The `onPriceChange` callback will be invoked every time a Pyth price gets updated.
This callback gets two arguments:
* `price` contains the official Pyth price and confidence, along with the component prices that were combined to produce this result.
* `product` contains metadata about the price feed, such as the symbol (e.g., "BTC/USD") and the number of decimal points.

See `src/example_usage.ts` for a runnable example of the above usage.
You can run this example with `npm run example`.

You may also register to specific account updates using `connection.onAccountChange` in the solana web3 API, then
use the methods in `index.ts` to parse the on-chain data structures into Javascript-friendly objects.

## Releases

In order to release a new version of this library and publish it to npm, follow these steps: 
1. Update `CHANGELOG.md` with a description of the changes in this version.
2. Run `npm version <new version number>`. This command will update the version of the package, tag the branch in git, and push your changes to github.
3. Once your change is merged into `main`, create a release, and a github action will automatically publish a new version of the package to npm.
