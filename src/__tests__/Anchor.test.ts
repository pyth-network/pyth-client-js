import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'
import { getPythProgramKeyForCluster, pythOracleProgram, PythOracleCoder } from '../index'

test('Anchor', (done) => {
  jest.setTimeout(60000)
  const provider = new AnchorProvider(
    new Connection('https://api.mainnet-beta.solana.com'),
    new Wallet(new Keypair()),
    AnchorProvider.defaultOptions(),
  )
  const pythOracle = pythOracleProgram(getPythProgramKeyForCluster('mainnet-beta'), provider)
  pythOracle.methods
    .initMapping()
    .accounts({ fundingAccount: PublicKey.unique(), freshMappingAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 0, 0, 0, 0]))
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
      expect(decoded?.name).toBe('initMapping')
      expect(decoded?.data).toStrictEqual({})
    })
  pythOracle.methods
    .addMapping()
    .accounts({ fundingAccount: PublicKey.unique(), curMapping: PublicKey.unique(), nextMapping: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 1, 0, 0, 0]))
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
      expect(decoded?.name).toBe('addMapping')
      expect(decoded?.data).toStrictEqual({})
    })
  pythOracle.methods
    .updProduct()
    .accounts({ fundingAccount: PublicKey.unique(), productAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 3, 0, 0, 0]))
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
      expect(decoded?.name).toBe('updProduct')
      expect(decoded?.data).toStrictEqual({})
    })

  pythOracle.methods
    .addPrice(1, 1)
    .accounts({ fundingAccount: PublicKey.unique(), productAccount: PublicKey.unique() })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]))
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
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
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
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
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
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
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
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
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
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
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
      expect(decoded?.name).toBe('setMinPub')
      expect(decoded?.data.minPub === 5).toBeTruthy()
    })

  pythOracle.methods
    .updPermissions(new PublicKey(6), new PublicKey(7), new PublicKey(8))
    .accounts({
      upgradeAuthority: PublicKey.unique(),
      programAccount: PublicKey.unique(),
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
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
      expect(decoded?.name).toBe('updPermissions')
      expect(decoded?.data.masterAuthority.equals(new PublicKey(6))).toBeTruthy()
      expect(decoded?.data.dataCurationAuthority.equals(new PublicKey(7))).toBeTruthy()
      expect(decoded?.data.securityAuthority.equals(new PublicKey(8))).toBeTruthy()
    })

  done()
})
