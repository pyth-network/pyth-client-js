import { clusterApiUrl, Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { getPythProgramKeyForCluster, parseProductData, PythHttpClient } from '..'

test('PythHttpClientCall: getData', (done) => {
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

test('PythHttpClientCall: getAssetPricesFromAccounts for one account', (done) => {
  const solUSDKey = new PublicKey('7VJsBtJzgTftYzEeooSDYyjKXvYRWJHdwvbwfBvTg9K')
  try {
    const programKey = getPythProgramKeyForCluster('testnet')
    const currentConnection = new Connection(clusterApiUrl('testnet'))
    const pyth_client = new PythHttpClient(currentConnection, programKey)
    pyth_client
      .getAssetPricesFromAccounts([solUSDKey])
      .then((result) => {
        try {
          expect(result.length).toBe(1)
          // Check the symbol through the product account
          const productAcc = result[0].productAccountKey

          return currentConnection.getAccountInfo(productAcc)
        } catch (cerr) {
          done(cerr)
        }
      })
      .then((productAcc) => {
        if (!productAcc) {
          done(new Error('Product account not found'))
        }
        // We can assert it's defined here because we call done otherwise above
        const productData = parseProductData(productAcc!.data)
        expect(productData.product.symbol).toBe('Crypto.SOL/USD')
        done()
      })
  } catch (err_catch) {
    done(err_catch)
  }
}, 20000)

test('PythHttpClientCall: getAssetPricesFromAccounts for multiple accounts', (done) => {
  const solUSDKey = new PublicKey('7VJsBtJzgTftYzEeooSDYyjKXvYRWJHdwvbwfBvTg9K')
  const bonkUSDKey = new PublicKey('FPPnzp74SGt72T463B62fQh3Di9fXrBe82YnQh8ycQp9')
  const usdcUSDKey = new PublicKey('GBvYgUMCt4nvycUZMEBpHyLEXGbKjr6G9HjMjmLyf6mA')

  try {
    const programKey = getPythProgramKeyForCluster('testnet')
    const currentConnection = new Connection(clusterApiUrl('testnet'))
    const pyth_client = new PythHttpClient(currentConnection, programKey)
    pyth_client
      .getAssetPricesFromAccounts([solUSDKey, bonkUSDKey, usdcUSDKey])
      .then((result) => {
        try {
          expect(result.length).toBe(3)
          // Check the symbol through the product account
          const productAccs = result.map((r) => r.productAccountKey)

          return currentConnection.getMultipleAccountsInfo(productAccs)
        } catch (cerr) {
          done(cerr)
        }
      })
      .then((productAccs) => {
        // We can assert it's defined here because we call done otherwise above
        const expectedSymbols = ['Crypto.SOL/USD', 'Crypto.BONK/USD', 'Crypto.USDC/USD']
        productAccs!.forEach((acc, i) => {
          if (!acc) {
            done(new Error('Product account not found'))
          }
          const productData = parseProductData(acc!.data)
          expect(productData.product.symbol).toBe(expectedSymbols[i])
        })
        done()
      })
  } catch (err_catch) {
    done(err_catch)
  }
}, 20000)

test('PythHttpClientCall: getAssetPricesFromAccounts should throw for invalid account inclusion', (done) => {
  const solUSDKey = new PublicKey('7VJsBtJzgTftYzEeooSDYyjKXvYRWJHdwvbwfBvTg9K')
  // Should never be a pricefeed
  const systemProgram = SystemProgram.programId
  const usdcUSDKey = new PublicKey('GBvYgUMCt4nvycUZMEBpHyLEXGbKjr6G9HjMjmLyf6mA')

  try {
    const programKey = getPythProgramKeyForCluster('testnet')
    const currentConnection = new Connection(clusterApiUrl('testnet'))
    const pyth_client = new PythHttpClient(currentConnection, programKey)
    pyth_client
      .getAssetPricesFromAccounts([solUSDKey, systemProgram, usdcUSDKey])
      .then((result) => {
        done(new Error('Should not have gotten here'))
      })
      .catch((err) => {
        expect(err.message).toBe('Account ' + systemProgram.toBase58() + ' is not a price account')
        done()
      })
  } catch (err_catch) {
    done(err_catch)
  }
}, 20000)
