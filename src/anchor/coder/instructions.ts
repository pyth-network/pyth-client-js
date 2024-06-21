// Borrowed from coral-xyz/anchor
//
// https://github.com/coral-xyz/anchor/blob/master/ts/packages/anchor/src/coder/borsh/instruction.ts

import bs58 from 'bs58'
import { Buffer } from 'buffer'
import { Layout } from 'buffer-layout'
import camelCase from 'camelcase'
import * as borsh from '@coral-xyz/borsh'
import { PublicKey } from '@solana/web3.js'
import { Idl, IdlField, IdlType, IdlAccountItem } from '@coral-xyz/anchor/dist/cjs/idl'
import { IdlCoder } from './idl'
import { InstructionCoder } from '@coral-xyz/anchor'
import { Product } from '../..'

const MAX_METADATA_SIZE: number = 464

export type PythIdlInstruction = {
  name: string
  docs?: string[]
  accounts: IdlAccountItem[]
  args: IdlField[]
  returns?: IdlType
  discriminant: IdlDiscriminant
}

export type IdlDiscriminant = {
  value: number[]
}

/**
 * Encodes and decodes program instructions.
 */
export class PythOracleInstructionCoder implements InstructionCoder {
  // Instruction args layout. Maps namespaced method
  private ixLayout: Map<string, Layout>

  // Base58 encoded sighash to instruction layout.
  private discriminatorLayouts: Map<string, { layout: Layout; name: string }>
  private ixDiscriminator: Map<string, Buffer>
  private discriminatorLength: number | undefined

  public constructor(private idl: Idl) {
    this.ixLayout = PythOracleInstructionCoder.parseIxLayout(idl)

    const discriminatorLayouts = new Map()
    const ixDiscriminator = new Map()
    idl.instructions.forEach((ix) => {
      const pythIx = ix as PythIdlInstruction
      let discriminatorLength: number
      if (pythIx.discriminant) {
        discriminatorLayouts.set(bs58.encode(Buffer.from(pythIx.discriminant.value)), {
          layout: this.ixLayout.get(pythIx.name),
          name: pythIx.name,
        })
        ixDiscriminator.set(pythIx.name, Buffer.from(pythIx.discriminant.value))
        discriminatorLength = pythIx.discriminant.value.length
      } else {
        throw new Error(`All instructions must have a discriminator`)
      }
      if (this.discriminatorLength && this.discriminatorLength !== discriminatorLength) {
        throw new Error(`All instructions must have the same discriminator length`)
      } else {
        this.discriminatorLength = discriminatorLength
      }
    })

    this.discriminatorLayouts = discriminatorLayouts
    this.ixDiscriminator = ixDiscriminator
  }

  /**
   * Encodes a program state instruction.
   */
  public encodeState(ixName: string, ix: any): Buffer {
    return this.encode(ixName, ix)
  }

  /**
   * Encodes a program instruction.
   */
  public encode(ixName: string, ix: any): Buffer {
    const buffer = Buffer.alloc(1000) // TODO: use a tighter buffer.
    const methodName = camelCase(ixName)

    const layout = this.ixLayout.get(methodName)
    const discriminator = this.ixDiscriminator.get(methodName)
    if (!layout || !discriminator) {
      throw new Error(`Unknown method: ${methodName}`)
    }

    /// updProduct and addProduct have their own format
    if (methodName === 'updProduct' || methodName === 'addProduct') {
      let offset = 0
      for (const key of Object.keys(ix.productMetadata)) {
        offset += buffer.subarray(offset).writeUInt8(key.length)
        offset += buffer.subarray(offset).write(key)
        offset += buffer.subarray(offset).writeUInt8(ix.productMetadata[key].length)
        offset += buffer.subarray(offset).write(ix.productMetadata[key])
      }
      if (offset > MAX_METADATA_SIZE) {
        throw new Error('The metadata is too long')
      }
      const data = buffer.subarray(0, offset)
      return Buffer.concat([discriminator, data])
    } else {
      const len = layout.encode(ix, buffer)
      const data = buffer.subarray(0, len)
      return Buffer.concat([discriminator, data])
    }
  }

  private static parseIxLayout(idl: Idl): Map<string, Layout> {
    const ixLayouts = idl.instructions.map((ix): [string, Layout<unknown>] => {
      const fieldLayouts = ix.args.map((arg: IdlField) =>
        IdlCoder.fieldLayout(arg, Array.from([...(idl.accounts ?? []), ...(idl.types ?? [])])),
      )
      const name = camelCase(ix.name)
      return [name, borsh.struct(fieldLayouts, name)]
    })

    return new Map(ixLayouts)
  }

  /**
   * Decodes a program instruction.
   */
  public decode(ix: Buffer | string, encoding: 'hex' | 'base58' = 'hex'): Instruction | null {
    if (typeof ix === 'string') {
      ix = encoding === 'hex' ? Buffer.from(ix, 'hex') : Buffer.from(bs58.decode(ix))
    }
    const discriminator = bs58.encode(ix.subarray(0, this.discriminatorLength))
    const data = ix.subarray(this.discriminatorLength)
    const decoder = this.discriminatorLayouts.get(discriminator)
    if (!decoder) {
      return null
    }

    /// updProduct and addProduct have their own format
    if (decoder.name === 'updProduct' || decoder.name === 'addProduct') {
      const product: Product = {}
      let idx = 0
      while (idx < data.length) {
        const keyLength = data[idx]
        idx++
        if (keyLength) {
          const key = data.slice(idx, idx + keyLength).toString()
          idx += keyLength
          const valueLength = data[idx]
          idx++
          const value = data.slice(idx, idx + valueLength).toString()
          idx += valueLength
          product[key] = value
        }
      }
      return {
        data: product,
        name: decoder.name,
      }
    } else {
      return {
        data: decoder.layout.decode(data),
        name: decoder.name,
      }
    }
  }
}

export type Instruction = {
  name: string
  data: any
}

export type InstructionDisplay = {
  args: { name: string; type: string; data: string }[]
  accounts: {
    name?: string
    pubkey: PublicKey
    isSigner: boolean
    isWritable: boolean
  }[]
}
