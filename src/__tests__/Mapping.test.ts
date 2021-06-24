import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { parseMappingData, Magic, Version } from '../index'

test('Mapping', (done) => {
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
        console.log(mapping)
        expect(mapping.magic).toBe(Magic)
        expect(mapping.version).toBe(Version)
        done()
      } else {
        done('No mapping accountInfo')
      }
    })
    .catch((error) => {
      done(error)
    })
})
