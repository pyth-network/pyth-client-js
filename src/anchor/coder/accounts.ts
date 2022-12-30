import { AccountsCoder, ACCOUNT_DISCRIMINATOR_SIZE, Idl } from "@coral-xyz/anchor";
import { IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";

export class PythOracleAccountCoder<A extends string = string>
  implements AccountsCoder
{
  constructor(private idl: Idl) {}

  public async encode<T = any>(accountName: A, account: T): Promise<Buffer> {
    throw new Error("Not implemented");
  }

  public decode<T = any>(accountName: A, ix: Buffer): T {
    throw new Error("Not implemented");
  }

  public decodeUnchecked<T = any>(accountName: A, ix: Buffer): T {
    throw new Error("Not implemented");
  }

  public memcmp(
    accountName: A,
    _appendData?: Buffer
  ): { dataSize?: number; offset?: number; bytes?: string } {
    throw new Error("Not implemented");
  }

  public size(idlAccount: IdlTypeDef): number {
    return 0;
}

}
