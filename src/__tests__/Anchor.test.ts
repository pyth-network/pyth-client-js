import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getPythProgramKeyForCluster, pythOracleProgram } from '../index'

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
    .accounts({ fundingAccount: new PublicKey(0) })
    .instruction()
    .then((x) => console.log(x))
  pythOracle.methods
    .addMapping()
    .accounts({ fundingAccount: new PublicKey(0) })
    .instruction()
    .then((x) => console.log(x))
  done()
})
