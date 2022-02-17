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
          console.log('products number: ', result.products.length)
          console.log('asset types: ', result.assetTypes)
          console.log('product symbols: ', result.symbols)

          // Find a product with symbol "SOL/USD"
          const products = result.products.filter((p) => p.symbol === 'Crypto.SOL/USD')
          expect(products.length).toBeGreaterThan(0)

          // Find product prices
          const price = result.productPrice.get(products[0].symbol)
          expect(price).toBeDefined()

          console.log('products', products)
          console.log('price', price)

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
