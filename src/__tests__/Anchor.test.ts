import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
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
    .accounts({ fundingAccount: new PublicKey(0), freshMappingAccount: new PublicKey(1) })
    .instruction()
    .then((instruction) => {
      expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 0, 0, 0, 0]))
      const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
      expect(decoded?.name).toBe('initMapping')
      expect(decoded?.data).toStrictEqual({})
    })
  pythOracle.methods
    .addMapping()
    .accounts({ fundingAccount: new PublicKey(0), curMapping: new PublicKey(1), nextMapping: new PublicKey(2) })
    .instruction()
    .then((instruction) => {
        expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 1, 0, 0, 0]))
        const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
        expect(decoded?.name).toBe('addMapping')
        expect(decoded?.data).toStrictEqual({})
      })
    pythOracle.methods
    .addMapping()
    .accounts({ fundingAccount: new PublicKey(0), curMapping: new PublicKey(1), nextMapping: new PublicKey(2) })
    .instruction()
    .then((instruction) => {
        expect(instruction.data).toStrictEqual(Buffer.from([2, 0, 0, 0, 1, 0, 0, 0]))
        const decoded = (pythOracle.coder as PythOracleCoder).instruction.decode(instruction.data)
        expect(decoded?.name).toBe('addMapping')
        expect(decoded?.data).toStrictEqual({})
      })
  done()
})
