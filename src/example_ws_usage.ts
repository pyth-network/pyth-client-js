import { Connection } from '@solana/web3.js'
import { PythConnection } from './PythConnection'
import { getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster } from './cluster'
import { PriceStatus } from '.'

const SOLANA_CLUSTER_NAME: PythCluster = 'mainnet-beta'
const connection = new Connection(getPythClusterApiUrl(SOLANA_CLUSTER_NAME))
const pythPublicKey = getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME)

const pythConnection = new PythConnection(connection, pythPublicKey)
pythConnection.onPriceChangeVerbose((productAccount, priceAccount) => {
  // The arguments to the callback include solana account information if you need it.
  const product = productAccount.accountInfo.data.product;
  const price = priceAccount.accountInfo.data;
  // sample output:
  // SRM/USD: $8.68725 ±$0.0131
  if (price.price && price.confidence) {
    // tslint:disable-next-line:no-console
    console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence} (account key: ${priceAccount.key} update slot: ${priceAccount.slot})`)
  } else {
    // tslint:disable-next-line:no-console
    console.log(`${product.symbol}: price currently unavailable. status is ${PriceStatus[price.status]}`)
  }
})

// tslint:disable-next-line:no-console
console.log('Reading from Pyth price feed...')
pythConnection.start()
