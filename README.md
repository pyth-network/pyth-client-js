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

This library provides a subscription model for consuming all price updates:

```javascript
import { Connection, PublicKey } from '@solana/web3.js'
import { parseMappingData, parsePriceData, parseProductData } from '@pythnetwork/client'
import { getPythProgramKeyForCluster } from '@pythnetwork/client'

const connection = new Connection(SOLANA_CLUSTER_URL)
const pythPublicKey = getPythProgramKeyForCluster(CLUSTER)

const pythConnection = new PythConnection(connection, pythPublicKey) 
pythConnection.onPriceChange((product, price) => {
  // sample output:
  // SRM/USD: $8.68725 ±$0.0131
  console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence}`)
})

pythConnection.start()
```

You may also register to specific account updates using `connection.onAccountChange` in the solana web3 API, then
use the methods in `index.ts` to parse the on-chain data structures into Javascript-friendly objects.