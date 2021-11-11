import { Cluster, clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { PythConnection } from './PythConnection'
import { getPythProgramKeyForCluster } from './cluster'

const SOLANA_CLUSTER_NAME: Cluster = 'devnet'
const connection = new Connection(clusterApiUrl(SOLANA_CLUSTER_NAME))
const pythPublicKey = getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME)

const pythConnection = new PythConnection(connection, pythPublicKey)
pythConnection.onPriceChange((product, price) => {
  // sample output:
  // SRM/USD: $8.68725 ±$0.0131
  if (price.price && price.confidence) {
    // tslint:disable-next-line:no-console
    console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence}`)
  } else {
    // tslint:disable-next-line:no-console
    console.log(`${product.symbol}: price currently unavailable`)
  }
})

// tslint:disable-next-line:no-console
console.log('Reading from Pyth price feed...')
pythConnection.start()
