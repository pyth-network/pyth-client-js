import { PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { readBigInt64LE, readBigUInt64LE } from './readBig'

export const Magic = 0xa1b2c3d4
export const Version2 = 2
export const Version = Version2
export const PriceStatus = ['Unknown', 'Trading', 'Halted', 'Auction']
export const CorpAction = ['NoCorpAct']
export const PriceType = ['Unknown', 'Price']
export const DeriveType = ['Unknown', 'TWAP', 'Volatility']

const empty32Buffer = Buffer.alloc(32)
const PKorNull = (data: Buffer) => (data.equals(empty32Buffer) ? null : new PublicKey(data))

export const parseMappingData = (data: Buffer) => {
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
  // TODO: check and use this
  // next mapping account (if any)
  const nextMappingAccount = PKorNull(data.slice(24, 56))
  // read each symbol account
  let offset = 56
  const productAccountKeys = []
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

interface ProductAttributes {
  [index: string]: string
}

export const parseProductData = (data: Buffer) => {
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
  const product: ProductAttributes = {}
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

const parsePriceInfo = (data: Buffer, exponent: number) => {
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

export const parsePriceData = (data: Buffer) => {
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
  // unused
  // const unused = accountInfo.data.readUInt32LE(28)
  // currently accumulating price slot
  const currentSlot = readBigUInt64LE(data, 32)
  // valid on-chain slot of aggregate price
  const validSlot = readBigUInt64LE(data, 40)
  // time-weighted average price
  const twapComponent = readBigInt64LE(data, 48)
  const twap = Number(twapComponent) * 10 ** exponent
  // annualized price volatility
  const avolComponent = readBigUInt64LE(data, 56)
  const avol = Number(avolComponent) * 10 ** exponent
  // space for future derived values
  const drv0Component = readBigInt64LE(data, 64)
  const drv0 = Number(drv0Component) * 10 ** exponent
  const drv1Component = readBigInt64LE(data, 72)
  const drv1 = Number(drv1Component) * 10 ** exponent
  const drv2Component = readBigInt64LE(data, 80)
  const drv2 = Number(drv2Component) * 10 ** exponent
  const drv3Component = readBigInt64LE(data, 88)
  const drv3 = Number(drv3Component) * 10 ** exponent
  const drv4Component = readBigInt64LE(data, 96)
  const drv4 = Number(drv4Component) * 10 ** exponent
  const drv5Component = readBigInt64LE(data, 104)
  const drv5 = Number(drv5Component) * 10 ** exponent
  // product id / reference account
  const productAccountKey = new PublicKey(data.slice(112, 144))
  // next price account in list
  const nextPriceAccountKey = PKorNull(data.slice(144, 176))
  // aggregate price updater
  const aggregatePriceUpdaterAccountKey = new PublicKey(data.slice(176, 208))
  const aggregatePriceInfo = parsePriceInfo(data.slice(208, 240), exponent)
  // price components - up to 32
  const priceComponents = []
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
    currentSlot,
    validSlot,
    twapComponent,
    twap,
    avolComponent,
    avol,
    drv0Component,
    drv0,
    drv1Component,
    drv1,
    drv2Component,
    drv2,
    drv3Component,
    drv3,
    drv4Component,
    drv4,
    drv5Component,
    drv5,
    productAccountKey,
    nextPriceAccountKey,
    aggregatePriceUpdaterAccountKey,
    ...aggregatePriceInfo,
    priceComponents,
  }
}
