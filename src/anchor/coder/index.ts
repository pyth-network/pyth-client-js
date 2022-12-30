import { Idl, Coder } from '@coral-xyz/anchor'

import { PythOracleEventCoder } from './events'
import { PythOracleAccountCoder } from './accounts'
import { PythOracleInstructionCoder } from './instructions'
import { PythOracleStateCoder } from './state'
import { PythOracleTypesCoder } from './types'

/**
 * Coder for PythOracleCoder
 */
export class PythOracleCoder implements Coder {
  readonly accounts: PythOracleAccountCoder
  readonly events: PythOracleEventCoder
  readonly instruction: PythOracleInstructionCoder
  readonly state: PythOracleStateCoder
  readonly types: PythOracleTypesCoder

  constructor(idl: Idl) {
    this.accounts = new PythOracleAccountCoder(idl)
    this.events = new PythOracleEventCoder(idl)
    this.instruction = new PythOracleInstructionCoder(idl)
    this.state = new PythOracleStateCoder(idl)
    this.types = new PythOracleTypesCoder(idl)
  }
}
