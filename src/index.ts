import { PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { readBigInt64LE, readBigUInt64LE } from './readBig'

/** Constants. This section must be kept in sync with the on-chain program. */

export const Magic = 0xa1b2c3d4
export const Version2 = 2
export const Version = Version2
export const PriceStatus = ['Unknown', 'Trading', 'Halted', 'Auction']
export const CorpAction = ['NoCorpAct']
export const PriceType = ['Unknown', 'Price']
export const DeriveType = ['Unknown', 'TWAP', 'Volatility']
export const AccountType = ['Unknown', 'Mapping', 'Product', 'Price', 'Test']

/** Number of slots that can pass before a publisher's price is no longer included in the aggregate. */
export const MAX_SLOT_DIFFERENCE = 25

const empty32Buffer = Buffer.alloc(32)
const PKorNull = (data: Buffer) => (data.equals(empty32Buffer) ? null : new PublicKey(data))

export interface Base {
  magic: number
  version: number
  type: number
  size: number
}

export interface MappingData extends Base {
  nextMappingAccount: PublicKey | null
  productAccountKeys: PublicKey[]
}

export interface Product {
  symbol: string
  asset_type: string
  quote_currency: string
  tenor: string
  [index: string]: string
}

export interface ProductData extends Base {
  priceAccountKey: PublicKey
  product: Product
}

export interface Price {
  priceComponent: bigint
  price: number
  confidenceComponent: bigint
  confidence: number
  status: number
  corporateAction: number
  publishSlot: bigint
}

export interface PriceComponent {
  publisher: PublicKey | null
  aggregate: Price
  latest: Price
}

export interface Ema {
  valueComponent: bigint
  value: number
  numerator: bigint
  denominator: bigint
}

export interface PriceData extends Base, Price {
  priceType: number
  exponent: number
  numComponentPrices: number
  numQuoters: number
  lastSlot: bigint
  validSlot: bigint
  twap: Ema
  twac: Ema
  drv1Component: bigint
  drv1: number
  drv2Component: bigint
  drv2: number
  productAccountKey: PublicKey
  nextPriceAccountKey: PublicKey | null
  previousSlot: bigint
  previousPriceComponent: bigint
  previousPrice: number
  previousConfidenceComponent: bigint
  previousConfidence: number
  drv3Component: bigint
  drv3: number
  priceComponents: PriceComponent[]
}

/** Parse data as a generic Pyth account. Use this method if you don't know the account type. */
export function parseBaseData(data: Buffer): Base | undefined {
  // data is too short to have the magic number.
  if (data.byteLength < 4) {
    return undefined
  }

  const magic = data.readUInt32LE(0)
  if (magic === Magic) {
    // program version
    const version = data.readUInt32LE(4)
    // account type
    const type = data.readUInt32LE(8)
    // account used size
    const size = data.readUInt32LE(12)
    return { magic, version, type, size }
  } else {
    return undefined
  }
}

export const parseMappingData = (data: Buffer): MappingData => {
  // pyth magic number
  const magic = data.readUInt32LE(0)
  // program version
  const version = data.readUInt32LE(4)
  // account type
  const type = data.readUInt32LE(8)
  // account used size
  const size = data.readUInt32LE(12)
  // number of product accounts
  const numProducts = data.readUInt32LE(16)
  // unused
  // const unused = accountInfo.data.readUInt32LE(20)
  // next mapping account (if any)
  const nextMappingAccount = PKorNull(data.slice(24, 56))
  // read each symbol account
  let offset = 56
  const productAccountKeys: PublicKey[] = []
  for (let i = 0; i < numProducts; i++) {
    const productAccountBytes = data.slice(offset, offset + 32)
    const productAccountKey = new PublicKey(productAccountBytes)
    offset += 32
    productAccountKeys.push(productAccountKey)
  }
  return {
    magic,
    version,
    type,
    size,
    nextMappingAccount,
    productAccountKeys,
  }
}

export const parseProductData = (data: Buffer): ProductData => {
  // pyth magic number
  const magic = data.readUInt32LE(0)
  // program version
  const version = data.readUInt32LE(4)
  // account type
  const type = data.readUInt32LE(8)
  // price account size
  const size = data.readUInt32LE(12)
  // first price account in list
  const priceAccountBytes = data.slice(16, 48)
  const priceAccountKey = new PublicKey(priceAccountBytes)
  const product = {} as Product
  let idx = 48
  while (idx < size) {
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
  return { magic, version, type, size, priceAccountKey, product }
}

const parseEma = (data: Buffer, exponent: number): Ema => {
  // current value of ema
  const valueComponent = readBigInt64LE(data, 0)
  const value = Number(valueComponent) * 10 ** exponent
  // numerator state for next update
  const numerator = readBigInt64LE(data, 8)
  // denominator state for next update
  const denominator = readBigInt64LE(data, 16)
  return { valueComponent, value, numerator, denominator }
}

const parsePriceInfo = (data: Buffer, exponent: number): Price => {
  // aggregate price
  const priceComponent = readBigInt64LE(data, 0)
  const price = Number(priceComponent) * 10 ** exponent
  // aggregate confidence
  const confidenceComponent = readBigUInt64LE(data, 8)
  const confidence = Number(confidenceComponent) * 10 ** exponent
  // aggregate status
  const status = data.readUInt32LE(16)
  // aggregate corporate action
  const corporateAction = data.readUInt32LE(20)
  // aggregate publish slot
  const publishSlot = readBigUInt64LE(data, 24)
  return {
    priceComponent,
    price,
    confidenceComponent,
    confidence,
    status,
    corporateAction,
    publishSlot,
  }
}

export const parsePriceData = (data: Buffer): PriceData => {
  // pyth magic number
  const magic = data.readUInt32LE(0)
  // program version
  const version = data.readUInt32LE(4)
  // account type
  const type = data.readUInt32LE(8)
  // price account size
  const size = data.readUInt32LE(12)
  // price or calculation type
  const priceType = data.readUInt32LE(16)
  // price exponent
  const exponent = data.readInt32LE(20)
  // number of component prices
  const numComponentPrices = data.readUInt32LE(24)
  // number of quoters that make up aggregate
  const numQuoters = data.readUInt32LE(28)
  // slot of last valid (not unknown) aggregate price
  const lastSlot = readBigUInt64LE(data, 32)
  // valid on-chain slot of aggregate price
  const validSlot = readBigUInt64LE(data, 40)
  // time-weighted average price
  const twap = parseEma(data.slice(48, 72), exponent)
  // time-weighted average confidence interval
  const twac = parseEma(data.slice(72, 96), exponent)
  // space for future derived values
  const drv1Component = readBigInt64LE(data, 96)
  const drv1 = Number(drv1Component) * 10 ** exponent
  const drv2Component = readBigInt64LE(data, 104)
  const drv2 = Number(drv2Component) * 10 ** exponent
  // product id / reference account
  const productAccountKey = new PublicKey(data.slice(112, 144))
  // next price account in list
  const nextPriceAccountKey = PKorNull(data.slice(144, 176))
  // valid slot of previous update
  const previousSlot = readBigUInt64LE(data, 176)
  // aggregate price of previous update
  const previousPriceComponent = readBigInt64LE(data, 184)
  const previousPrice = Number(previousPriceComponent) * 10 ** exponent
  // confidence interval of previous update
  const previousConfidenceComponent = readBigUInt64LE(data, 192)
  const previousConfidence = Number(previousConfidenceComponent) * 10 ** exponent
  // space for future derived values
  const drv3Component = readBigInt64LE(data, 200)
  const drv3 = Number(drv3Component) * 10 ** exponent
  const aggregatePriceInfo = parsePriceInfo(data.slice(208, 240), exponent)
  // price components - up to 32
  const priceComponents: PriceComponent[] = []
  let offset = 240
  let shouldContinue = true
  while (offset < data.length && shouldContinue) {
    const publisher = PKorNull(data.slice(offset, offset + 32))
    offset += 32
    if (publisher) {
      const aggregate = parsePriceInfo(data.slice(offset, offset + 32), exponent)
      offset += 32
      const latest = parsePriceInfo(data.slice(offset, offset + 32), exponent)
      offset += 32
      priceComponents.push({ publisher, aggregate, latest })
    } else {
      shouldContinue = false
    }
  }
  return {
    magic,
    version,
    type,
    size,
    priceType,
    exponent,
    numComponentPrices,
    numQuoters,
    lastSlot,
    validSlot,
    twap,
    twac,
    drv1Component,
    drv1,
    drv2Component,
    drv2,
    productAccountKey,
    nextPriceAccountKey,
    previousSlot,
    previousPriceComponent,
    previousPrice,
    previousConfidenceComponent,
    previousConfidence,
    drv3Component,
    drv3,
    ...aggregatePriceInfo,
    priceComponents,
  }
}

console.log("hey")

export { PythConnection } from './PythConnection';
export { getPythProgramKeyForCluster } from './cluster';
