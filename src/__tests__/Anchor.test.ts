import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'
import { getPythClusterApiUrl } from '../cluster'
import { getPythProgramKeyForCluster, pythOracleProgram, pythOracleCoder } from '../index'

test('Anchor', (done) => {
  jest.setTimeout(60000)
  const provider = new AnchorProvider(
    new Connection(getPythClusterApiUrl('pythnet')),
    new Wallet(new Keypair()),
    AnchorProvider.defaultOptions(),
  )
  const pythOracle = pythOracleProgram(getPythProgramKeyForCluster('pythnet'), provider)
  pythOracle.methods
    .initMapping()
    .accounts({ fundingAccount: PublicKey.unique(), freshMappingAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 0, 0, 0, 0]))
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('initMapping')
      expect(decoded?.data).toStrictEqual({})
    })
  pythOracle.methods
    .addMapping()
    .accounts({ fundingAccount: PublicKey.unique(), curMapping: PublicKey.unique(), nextMapping: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 1, 0, 0, 0]))
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('addMapping')
      expect(decoded?.data).toStrictEqual({})
    })
  pythOracle.methods
    .addProduct({
      asset_type: 'Crypto',
      base: 'ETH',
      description: 'ETH/USD',
      quote_currency: 'USD',
      symbol: 'Crypto.ETH/USD',
      generic_symbol: 'ETHUSD',
    })
    .accounts({
      fundingAccount: PublicKey.unique(),
      productAccount: PublicKey.unique(),
      tailMappingAccount: PublicKey.unique(),
    })
    .instruction()
    .then((instruction) => {
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('addProduct')
      expect(decoded?.data.asset_type).toBe('Crypto')
      expect(decoded?.data.base).toBe('ETH')
      expect(decoded?.data.description).toBe('ETH/USD')
      expect(decoded?.data.quote_currency).toBe('USD')
      expect(decoded?.data.symbol).toBe('Crypto.ETH/USD')
      expect(decoded?.data.generic_symbol).toBe('ETHUSD')
    })

  pythOracle.methods
    .updProduct({
      asset_type: 'Crypto',
      base: 'BTC',
      description: 'BTC/USD',
      quote_currency: 'USD',
      symbol: 'Crypto.BTC/USD',
      generic_symbol: 'BTCUSD',
    })
    .accounts({ fundingAccount: PublicKey.unique(), productAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('updProduct')
      expect(decoded?.data.asset_type).toBe('Crypto')
      expect(decoded?.data.base).toBe('BTC')
      expect(decoded?.data.description).toBe('BTC/USD')
      expect(decoded?.data.quote_currency).toBe('USD')
      expect(decoded?.data.symbol).toBe('Crypto.BTC/USD')
      expect(decoded?.data.generic_symbol).toBe('BTCUSD')
    })

  pythOracle.methods
    .addPrice(1, 1)
    .accounts({
      fundingAccount: PublicKey.unique(),
      productAccount: PublicKey.unique(),
      priceAccount: PublicKey.unique(),
    })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]))
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('addPrice')
      expect(decoded?.data).toStrictEqual({ expo: 1, pType: 1 })
    })

  pythOracle.methods
    .addPublisher(new PublicKey(5))
    .accounts({ fundingAccount: PublicKey.unique(), priceAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(
        Buffer.from([
          2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 5,
        ]),
      )
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('addPublisher')
      expect(decoded?.data.pub.equals(new PublicKey(5))).toBeTruthy()
    })

  pythOracle.methods
    .updPrice(1, 0, new BN(42), new BN(9), new BN(1))
    .accounts({ fundingAccount: PublicKey.unique(), priceAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(
        Buffer.from([
          2, 0, 0, 0, 7, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0,
        ]),
      )
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('updPrice')
      expect(decoded?.data.status === 1).toBeTruthy()
      expect(decoded?.data.price.eq(new BN(42))).toBeTruthy()
      expect(decoded?.data.conf.eq(new BN(9))).toBeTruthy()
      expect(decoded?.data.pubSlot.eq(new BN(1))).toBeTruthy()
    })

  pythOracle.methods
    .updPriceNoFailOnError(1, 0, new BN(42), new BN(9), new BN(1))
    .accounts({ fundingAccount: PublicKey.unique(), priceAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(
        Buffer.from([
          2, 0, 0, 0, 13, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0,
        ]),
      )
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('updPriceNoFailOnError')
      expect(decoded?.data.status === 1).toBeTruthy()
      expect(decoded?.data.price.eq(new BN(42))).toBeTruthy()
      expect(decoded?.data.conf.eq(new BN(9))).toBeTruthy()
      expect(decoded?.data.pubSlot.eq(new BN(1))).toBeTruthy()
    })

  pythOracle.methods
    .aggPrice(1, 0, new BN(42), new BN(9), new BN(1))
    .accounts({ fundingAccount: PublicKey.unique(), priceAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(
        Buffer.from([
          2, 0, 0, 0, 8, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0,
        ]),
      )
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('aggPrice')
      expect(decoded?.data.status === 1).toBeTruthy()
      expect(decoded?.data.price.eq(new BN(42))).toBeTruthy()
      expect(decoded?.data.conf.eq(new BN(9))).toBeTruthy()
      expect(decoded?.data.pubSlot.eq(new BN(1))).toBeTruthy()
    })

  pythOracle.methods
    .setMinPub(5, [0, 0, 0])
    .accounts({ fundingAccount: PublicKey.unique(), priceAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 12, 0, 0, 0, 5, 0, 0, 0]))
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('setMinPub')
      expect(decoded?.data.minPub === 5).toBeTruthy()
    })

  pythOracle.methods
    .updPermissions(new PublicKey(6), new PublicKey(7), new PublicKey(8))
    .accounts({
      upgradeAuthority: PublicKey.unique(),
      programDataAccount: PublicKey.unique(),
    })
    .instruction()
    .then((instruction) => {
      const expectedPda = PublicKey.findProgramAddressSync([Buffer.from('permissions')], pythOracle.programId)[0]
      expect(expectedPda.equals(instruction.keys[3].pubkey))
      expect(instruction.data).toStrictEqual(
        Buffer.from([
          2, 0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8,
        ]),
      )
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('updPermissions')
      expect(decoded?.data.masterAuthority.equals(new PublicKey(6))).toBeTruthy()
      expect(decoded?.data.dataCurationAuthority.equals(new PublicKey(7))).toBeTruthy()
      expect(decoded?.data.securityAuthority.equals(new PublicKey(8))).toBeTruthy()
    })

  pythOracle.methods
    .setMaxLatency(1, [0, 0, 0])
    .accounts({ fundingAccount: PublicKey.unique(), priceAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 18, 0, 0, 0, 1, 0, 0, 0]))
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('setMaxLatency')
      expect(decoded?.data.maxLatency === 1).toBeTruthy()
    })

  pythOracle.methods
    .initPriceFeedIndex()
    .accounts({
      fundingAccount: PublicKey.unique(),
      priceAccount: PublicKey.unique(),
    })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 19, 0, 0, 0]))
      const decoded = pythOracleCoder().instruction.decode(instruction.data)
      expect(decoded?.name).toBe('initPriceFeedIndex')
      expect(decoded?.data).toStrictEqual({})
    })

  done()
})
