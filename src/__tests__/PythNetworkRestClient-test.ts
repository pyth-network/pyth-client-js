import { clusterApiUrl, Connection } from '@solana/web3.js'
import { getPythProgramKeyForCluster, PythHttpClient } from '..'

test('PythHttpClientCall', (done) => {
  jest.setTimeout(20000)
  try {
    const programKey = getPythProgramKeyForCluster('testnet')
    const currentConnection = new Connection(clusterApiUrl('testnet'))
    const pyth_client = new PythHttpClient(currentConnection, programKey)
    pyth_client.getData().then(
      (result) => {
        try {
          // Find a product with symbol "SOL/USD"
          const products = result.products.filter((p) => p.symbol === 'Crypto.SOL/USD')
          expect(products.length).toBeGreaterThan(0)

          done()
        } catch (cerr) {
          done(cerr)
        }
      },
      (err) => done(err),
    )
  } catch (err_catch) {
    done(err_catch)
  }
})
