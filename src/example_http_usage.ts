import { Connection } from '@solana/web3.js'
import { PriceStatus, PythHttpClient, getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster } from '.'

const PYTHNET_CLUSTER_NAME: PythCluster = 'pythnet'
const connection = new Connection(getPythClusterApiUrl(PYTHNET_CLUSTER_NAME))
const pythPublicKey = getPythProgramKeyForCluster(PYTHNET_CLUSTER_NAME)

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
