import { Idl, TypesCoder } from '@coral-xyz/anchor'

export class PythOracleTypesCoder implements TypesCoder {
  encode<T = any>(_name: string, _type: T): Buffer {
    throw new Error('Not implemented')
  }
  decode<T = any>(_name: string, _typeData: Buffer): T {
    throw new Error('Not implemented')
  }
}
