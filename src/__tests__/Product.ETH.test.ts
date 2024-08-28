import { Connection, PublicKey } from '@solana/web3.js'
import { getPythClusterApiUrl, Magic, parseProductData, Version } from '../index'

test('Product', (done) => {
  jest.setTimeout(60000)
  const url = getPythClusterApiUrl('pythtest-crosschain')
  const ethProductKey = '2ciUuGZiee5macAMeQ7bHGTJtwcYTgnt6jdmQnnKZrfu'
  const connection = new Connection(url)
  const publicKey = new PublicKey(ethProductKey)
  connection
    .getAccountInfo(publicKey)
    .then((accountInfo) => {
      if (accountInfo && accountInfo.data) {
        const product = parseProductData(accountInfo.data)
        console.log(product)
        expect(product.magic).toBe(Magic)
        expect(product.version).toBe(Version)
        expect(product.product.symbol).toBe('Crypto.ETH/USD')
        done()
      } else {
        done('No product accountInfo')
      }
    })
    .catch((error) => {
      done(error)
    })
})
