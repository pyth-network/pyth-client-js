import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { parseMappingData, parseProductData, Magic, Version } from '../index'

test('Product', (done) => {
  jest.setTimeout(60000)
  const url = clusterApiUrl('devnet')
  const oraclePublicKey = 'BmA9Z6FjioHJPpjT39QazZyhDRUdZy2ezwx4GiDdE2u2'
  const connection = new Connection(url)
  const publicKey = new PublicKey(oraclePublicKey)
  connection
    .getAccountInfo(publicKey)
    .then((accountInfo) => {
      if (accountInfo && accountInfo.data) {
        const mapping = parseMappingData(accountInfo.data)
        connection
          .getAccountInfo(mapping.productAccountKeys[mapping.productAccountKeys.length - 1])
          .then((accountInfo) => {
            if (accountInfo && accountInfo.data) {
              const product = parseProductData(accountInfo.data)
              console.log(product)
              expect(product.magic).toBe(Magic)
              expect(product.version).toBe(Version)
              done()
            } else {
              done('No product accountInfo')
            }
          })
      } else {
        done('No mapping accountInfo')
      }
    })
    .catch((error) => {
      done(error)
    })
})
