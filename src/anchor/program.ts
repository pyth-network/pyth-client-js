import { PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor'
import { PythOracleCoder } from './coder'
import IDL from './idl.json'

/** The Pyth program is not fully compatible with Anchor idls.
 * However it can be interacted with from Anchor clients by using PythOracleCoder from this library.
 * It currently only supports instructions. To deserialize accounts one can use the non-Anchor
 * parsing functions from this package.
 */
export function pythOracleProgram(programId: PublicKey, provider: AnchorProvider): Program<PythOracle> {
  return new Program<PythOracle>(IDL as PythOracle, programId, provider, new PythOracleCoder(IDL as Idl))
}

export function pythOracleCoder(): PythOracleCoder {
  return new PythOracleCoder(IDL as PythOracle)
}

export { default as pythIdl } from './idl.json'

export type PythOracle = {
  version: '2.20.0'
  name: 'pyth_oracle'
  instructions: [
    {
      name: 'initMapping'
      discriminant: { value: [2, 0, 0, 0, 0, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'freshMappingAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: []
    },
    {
      name: 'addMapping'
      discriminant: { value: [2, 0, 0, 0, 1, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'curMapping'
          isMut: true
          isSigner: false
        },
        {
          name: 'nextMapping'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: []
    },
    {
      name: 'addProduct'
      discriminant: { value: [2, 0, 0, 0, 2, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'tailMappingAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'productAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: []
    },
    {
      name: 'updProduct'
      discriminant: { value: [2, 0, 0, 0, 3, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'productAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: []
    },
    {
      name: 'addPrice'
      discriminant: { value: [2, 0, 0, 0, 4, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'productAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: [
        {
          name: 'expo'
          type: 'i32'
        },
        {
          name: 'pType'
          type: 'u32'
        },
      ]
    },
    {
      name: 'addPublisher'
      discriminant: { value: [2, 0, 0, 0, 5, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: [
        {
          name: 'pub'
          type: 'publicKey'
        },
      ]
    },
    {
      name: 'delPublisher'
      discriminant: { value: [2, 0, 0, 0, 6, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: [
        {
          name: 'pub'
          type: 'publicKey'
        },
      ]
    },
    {
      name: 'updPrice'
      discriminant: { value: [2, 0, 0, 0, 7, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'clock'
          isMut: false
          isSigner: false
        },
      ]
      args: [
        {
          name: 'status'
          type: 'u32'
        },
        {
          name: 'unused'
          type: 'u32'
        },
        {
          name: 'price'
          type: 'i64'
        },
        {
          name: 'conf'
          type: 'u64'
        },
        {
          name: 'pubSlot'
          type: 'u64'
        },
      ]
    },
    {
      name: 'aggPrice'
      discriminant: { value: [2, 0, 0, 0, 8, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'clock'
          isMut: false
          isSigner: false
        },
      ]
      args: [
        {
          name: 'status'
          type: 'u32'
        },
        {
          name: 'unused'
          type: 'u32'
        },
        {
          name: 'price'
          type: 'i64'
        },
        {
          name: 'conf'
          type: 'u64'
        },
        {
          name: 'pubSlot'
          type: 'u64'
        },
      ]
    },
    {
      name: 'initPrice'
      discriminant: { value: [2, 0, 0, 0, 9, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: [
        {
          name: 'expo'
          type: 'i32'
        },
        {
          name: 'pType'
          type: 'u32'
        },
      ]
    },
    {
      name: 'setMinPub'
      discriminant: { value: [2, 0, 0, 0, 12, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: [
        {
          name: 'minPub'
          type: 'u8'
        },
        {
          name: 'unused'
          type: {
            array: ['u8', 3]
          }
        },
      ]
    },
    {
      name: 'updPriceNoFailOnError'
      discriminant: { value: [2, 0, 0, 0, 13, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'clock'
          isMut: false
          isSigner: false
        },
      ]
      args: [
        {
          name: 'status'
          type: 'u32'
        },
        {
          name: 'unused'
          type: 'u32'
        },
        {
          name: 'price'
          type: 'i64'
        },
        {
          name: 'conf'
          type: 'u64'
        },
        {
          name: 'pubSlot'
          type: 'u64'
        },
      ]
    },
    {
      name: 'resizeAccount'
      discriminant: { value: [2, 0, 0, 0, 14, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: []
    },
    {
      name: 'delPrice'
      discriminant: { value: [2, 0, 0, 0, 15, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'productAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'priceAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: []
    },
    {
      name: 'delProduct'
      discriminant: { value: [2, 0, 0, 0, 16, 0, 0, 0] }
      accounts: [
        {
          name: 'fundingAccount'
          isMut: true
          isSigner: true
        },
        {
          name: 'mappingAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'productAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
      ]
      args: []
    },
    {
      name: 'updPermissions'
      discriminant: { value: [2, 0, 0, 0, 17, 0, 0, 0] }
      accounts: [
        {
          name: 'upgradeAuthority'
          isMut: true
          isSigner: true
        },
        {
          name: 'programDataAccount'
          isMut: false
          isSigner: false
        },
        {
          name: 'permissionsAccount'
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'const'
                type: 'string'
                value: 'permissions'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
      ]
      args: [
        {
          name: 'masterAuthority'
          type: 'publicKey'
        },
        {
          name: 'dataCurationAuthority'
          type: 'publicKey'
        },
        {
          name: 'securityAuthority'
          type: 'publicKey'
        },
      ]
    },
  ]
}
