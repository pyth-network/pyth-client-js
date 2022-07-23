import { Connection } from '@solana/web3.js'
import { getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster } from './cluster'
import { PriceStatus, PythHttpClient } from '.'

const SOLANA_CLUSTER_NAME: PythCluster = 'mainnet-beta'
const connection = new Connection(getPythClusterApiUrl(SOLANA_CLUSTER_NAME))
const pythPublicKey = getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME)

async function runQuery(): Promise<void> {
  const pythClient = new PythHttpClient(connection, pythPublicKey)
  const data = await pythClient.getData()

  for (const symbol of data.symbols) {
    const price = data.productPrice.get(symbol)!

    if (price.price && price.confidence) {
      // tslint:disable-next-line:no-console
      console.log(`${symbol}: $${price.price} \xB1$${price.confidence}`)
    } else {
      // tslint:disable-next-line:no-console
      console.log(`${symbol}: price currently unavailable. status is ${PriceStatus[price.status]}`)
    }
  }
}

runQuery()
