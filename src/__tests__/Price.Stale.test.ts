import { AccountInfo, clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { Magic, MAX_SLOT_DIFFERENCE, parsePriceData, Version } from '../index'

test('Product', (done) => {
  jest.setTimeout(60000)
  const url = clusterApiUrl('devnet')
  const ethPriceKey = 'EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw'
  const connection = new Connection(url)
  const publicKey = new PublicKey(ethPriceKey)


  async function checkPriceStale() {
    let accountInfo = await connection.getAccountInfo(publicKey)
  
    if (accountInfo && accountInfo.data) {
      const price = parsePriceData(accountInfo.data)
      console.log(price)
      expect(price.magic).toBe(Magic)
      expect(price.version).toBe(Version)
      
      if (price.status == 1) { // Trading
        console.log("It is in trading status. Testing getting stale")
        expect(parsePriceData(accountInfo.data, Number(price.aggregate.publishSlot) + MAX_SLOT_DIFFERENCE).status).toBe(1)

        const stalePrice = parsePriceData(accountInfo.data, Number(price.aggregate.publishSlot) + MAX_SLOT_DIFFERENCE + 1)
        expect(stalePrice.status).toBe(0)  
        expect(stalePrice.price).toBeUndefined()
        expect(stalePrice.confidence).toBeUndefined()
      } else {
        await checkPriceStale()
      }

      done()
    } else {
      done('No product accountInfo')
    }
  }

  checkPriceStale()
})
