import { Connection, PublicKey, clusterApiUrl, Cluster, Commitment, AccountInfo, Account } from '@solana/web3.js'
import {
  Base,
  Magic,
  parseMappingData,
  parseBaseData,
  parsePriceData,
  parseProductData,
  Price,
  PriceData,
  Product,
  ProductData,
  Version,
  AccountType,
  MAX_SLOT_DIFFERENCE,
  PriceStatus,
} from './index'

const ONES = '11111111111111111111111111111111'

/**
 * Type of callback invoked whenever a pyth price account changes. The callback additionally
 * gets access product, which contains the metadata for this price account (e.g., that the symbol is "BTC/USD")
 */
export type PythPriceCallback = (product: Product, price: PriceData) => void

/**
 * Reads Pyth price data from a solana web3 connection. This class uses a callback-driven model,
 * similar to the solana web3 methods for tracking updates to accounts.
 */
export class PythConnection {
  connection: Connection
  pythProgramKey: PublicKey
  commitment: Commitment

  productAccountKeyToProduct: Record<string, Product> = {}
  priceAccountKeyToProductAccountKey: Record<string, string> = {}
  priceAccountKeyPublishedSlot: Record<string, number> = {}
  newPricesQueue: { key: PublicKey; publishedSlot: number; account: AccountInfo<Buffer> }[] = [] // Used to handle prices going stale

  callbacks: PythPriceCallback[] = []

  private handleProductAccount(key: PublicKey, account: AccountInfo<Buffer>) {
    const { priceAccountKey, type, product } = parseProductData(account.data)
    this.productAccountKeyToProduct[key.toString()] = product
    if (priceAccountKey.toString() !== ONES) {
      this.priceAccountKeyToProductAccountKey[priceAccountKey.toString()] = key.toString()
    }
  }

  private handlePriceAccount(key: PublicKey, account: AccountInfo<Buffer>, slot: number) {
    const product = this.productAccountKeyToProduct[this.priceAccountKeyToProductAccountKey[key.toString()]]
    if (product === undefined) {
      // This shouldn't happen since we're subscribed to all of the program's accounts,
      // but let's be good defensive programmers.
      throw new Error(
        'Got a price update for an unknown product. This is a bug in the library, please report it to the developers.',
      )
    }

    const priceData = parsePriceData(account.data, slot)

    if (priceData.status === PriceStatus.Trading) {
      const publishedSlot = Number(priceData.aggregate.publishSlot)

      this.priceAccountKeyPublishedSlot[key.toString()] = publishedSlot
      this.newPricesQueue.push({ key, publishedSlot: Number(priceData.aggregate.publishSlot), account })
    }

    for (const callback of this.callbacks) {
      callback(product, priceData)
    }
  }

  private handleAccount(key: PublicKey, account: AccountInfo<Buffer>, productOnly: boolean, slot: number) {
    const base = parseBaseData(account.data)
    // The pyth program owns accounts that don't contain pyth data, which we can safely ignore.
    if (base) {
      switch (base.type) {
        case AccountType.Mapping:
          // We can skip these because we're going to get every account owned by this program anyway.
          break
        case AccountType.Product:
          this.handleProductAccount(key, account)
          break
        case AccountType.Price:
          if (!productOnly) {
            this.handlePriceAccount(key, account, slot)
          }
          break
        case AccountType.Test:
          break
        default:
          throw new Error(`Unknown account type: ${base.type}. Try upgrading pyth-client.`)
      }
    }
  }

  private async handleStalePrice() {
    const slot = await this.connection.getSlot(this.commitment)

    while (this.newPricesQueue.length > 0) {
      const price = this.newPricesQueue[0]

      if (this.priceAccountKeyPublishedSlot[price.key.toString()] !== price.publishedSlot) {
        this.newPricesQueue.shift()
        continue
      }

      if (slot - price.publishedSlot > MAX_SLOT_DIFFERENCE) {
        this.newPricesQueue.shift()
        this.handlePriceAccount(price.key, price.account, slot)
      } else {
        break
      }
    }
  }

  /** Create a PythConnection that reads its data from an underlying solana web3 connection.
   *  pythProgramKey is the public key of the Pyth program running on the chosen solana cluster.
   */
  constructor(connection: Connection, pythProgramKey: PublicKey, commitment: Commitment = 'finalized') {
    this.connection = connection
    this.pythProgramKey = pythProgramKey
    this.commitment = commitment
  }

  /** Start receiving price updates. Once this method is called, any registered callbacks will be invoked
   *  each time a Pyth price account is updated.
   */
  public async start() {
    const accounts = await this.connection.getProgramAccounts(this.pythProgramKey, this.commitment)
    const currentSlot = await this.connection.getSlot(this.commitment)
    for (const account of accounts) {
      this.handleAccount(account.pubkey, account.account, true, currentSlot)
    }

    this.connection.onProgramAccountChange(
      this.pythProgramKey,
      (keyedAccountInfo, context) => {
        this.handleAccount(keyedAccountInfo.accountId, keyedAccountInfo.accountInfo, false, context.slot)
      },
      this.commitment,
    )

    this.connection.onSlotChange((_) => this.handleStalePrice())
  }

  /** Register callback to receive price updates. */
  public onPriceChange(callback: PythPriceCallback) {
    this.callbacks.push(callback)
  }

  /** Stop receiving price updates. Note that this also currently deletes all registered callbacks. */
  public async stop() {
    // There's no way to actually turn off the solana web3 subscription x_x, but there should be.
    // Leave this method in so we don't have to update our API when solana fixes theirs.
    // In the interim, delete callbacks.
    this.callbacks = []
  }
}
