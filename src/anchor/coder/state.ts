import { Idl, StateCoder } from "@coral-xyz/anchor";

export class PythOracleStateCoder implements StateCoder {
  constructor(_idl: Idl) {}

  encode<T = any>(_name: string, _account: T): Promise<Buffer> {
    throw new Error("Not implemented");
  }
  decode<T = any>(_ix: Buffer): T {
    throw new Error("Not implemented");
  }
}