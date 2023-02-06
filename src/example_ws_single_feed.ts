import { Connection, PublicKey } from '@solana/web3.js'
import { PythConnection } from './PythConnection'
import { getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster, PriceStatus } from '.'

const PYTHNET_CLUSTER_NAME: PythCluster = 'pythnet'
const connection = new Connection(getPythClusterApiUrl(PYTHNET_CLUSTER_NAME))
const pythPublicKey = getPythProgramKeyForCluster(PYTHNET_CLUSTER_NAME)
// This feed ID comes from this list: https://pyth.network/developers/price-feed-ids#solana-mainnet-beta
// This example shows Crypto.SOL/USD
const feeds = [new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG')]

const pythConnection = new PythConnection(connection, pythPublicKey, "confirmed", feeds)
pythConnection.onPriceChangeVerbose((productAccount, priceAccount) => {
  // The arguments to the callback include solana account information / the update slot if you need it.
  const product = productAccount.accountInfo.data.product
  const price = priceAccount.accountInfo.data
  // sample output:
  // SOL/USD: $14.627930000000001 ±$0.01551797
  if (price.price && price.confidence) {
    // tslint:disable-next-line:no-console
    console.log(`${product.symbol}: $${price.price} \xB1$${price.confidence}`)
  } else {
    // tslint:disable-next-line:no-console
    console.log(`${product.symbol}: price currently unavailable. status is ${PriceStatus[price.status]}`)
  }
})

// tslint:disable-next-line:no-console
console.log('Reading from Pyth price feed...')
pythConnection.start()
