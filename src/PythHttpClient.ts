import { Commitment, Connection, PublicKey } from '@solana/web3.js'
import {
  Product,
  PriceData,
  parseProductData,
  parsePriceData,
  parseBaseData,
  AccountType,
  parsePermissionData,
  PermissionData,
} from '.'

export interface PythHttpClientResult {
  assetTypes: string[]
  /** The name of each product, e.g., "Crypto.BTC/USD" */
  symbols: string[]
  products: Product[]
  /** Metadata for each product. */
  productFromSymbol: Map<string, Product>
  /** The current price of each product. */
  productPrice: Map<string, PriceData>
  prices: PriceData[]
  permissionData: PermissionData | undefined
}

/**
 * Reads Pyth price data from a solana web3 connection. This class uses a single HTTP call.
 * Use the method getData() to get updated prices values.
 */
export class PythHttpClient {
  connection: Connection
  pythProgramKey: PublicKey
  commitment: Commitment

  constructor(connection: Connection, pythProgramKey: PublicKey, commitment: Commitment = 'finalized') {
    this.connection = connection
    this.pythProgramKey = pythProgramKey
    this.commitment = commitment
  }

  /*
   * Get Pyth Network account information and return actual price state.
   * The result contains lists of asset types, product symbols and their prices.
   */
  public async getData(): Promise<PythHttpClientResult> {
    const assetTypes = new Set<string>()
    const productSymbols = new Set<string>()
    const products = new Set<Product>()
    const productFromSymbol = new Map<string, Product>()
    const productPrice = new Map<string, PriceData>()
    const prices = new Array<PriceData>()

    // Retrieve data from blockchain
    const [accountList, currentSlot] = await Promise.all([
      this.connection.getProgramAccounts(this.pythProgramKey, this.commitment),
      this.connection.getSlot(this.commitment),
    ])

    // Populate products and prices
    const priceDataQueue = new Array<PriceData>()
    const productAccountKeyToProduct = new Map<string, Product>()

    // Initialize permission field as undefined
    let permissionData

    accountList.forEach((singleAccount) => {
      const base = parseBaseData(singleAccount.account.data)
      if (base) {
        switch (base.type) {
          case AccountType.Mapping:
            // We can skip these because we're going to get every account owned by this program anyway.
            break
          case AccountType.Product:
            const productData = parseProductData(singleAccount.account.data)

            productAccountKeyToProduct.set(singleAccount.pubkey.toBase58(), productData.product)
            assetTypes.add(productData.product.asset_type)
            productSymbols.add(productData.product.symbol)
            products.add(productData.product)
            productFromSymbol.set(productData.product.symbol, productData.product)
            break
          case AccountType.Price:
            const priceData = parsePriceData(singleAccount.account.data, currentSlot)
            priceDataQueue.push(priceData)
            break
          case AccountType.Test:
            break
          case AccountType.Permission:
            permissionData = parsePermissionData(singleAccount.account.data)
            break

          default:
            throw new Error(`Unknown account type: ${base.type}. Try upgrading pyth-client.`)
        }
      }
    })

    priceDataQueue.forEach((priceData) => {
      const product = productAccountKeyToProduct.get(priceData.productAccountKey.toBase58())

      if (product) {
        productPrice.set(product.symbol, priceData)
        prices.push(priceData)
      }
    })

    const result: PythHttpClientResult = {
      assetTypes: Array.from(assetTypes),
      symbols: Array.from(productSymbols),
      products: Array.from(products),
      productFromSymbol,
      productPrice,
      prices,
      permissionData,
    }

    return result
  }

  /**
   * Get the price state for an array of specified price accounts.
   * The result is the price state for the given assets if they exist, throws if at least one account does not exist.
   */
  public async getAssetPricesFromAccounts(priceAccounts: PublicKey[]): Promise<PriceData[]> {
    const priceDatas: PriceData[] = []

    const [accountInfos, currentSlot] = await Promise.all([
      this.connection.getMultipleAccountsInfo(priceAccounts, this.commitment),
      this.connection.getSlot(this.commitment),
    ])

    for (let i = 0; i < priceAccounts.length; i++) {
      // Declare local variable to silence typescript warning; otherwise it thinks accountInfos[i] can be undefined
      const accInfo = accountInfos[i]
      if (!accInfo) {
        throw new Error('Could not get account info for account ' + priceAccounts[i].toBase58())
      }

      const baseData = parseBaseData(accInfo.data)
      if (baseData === undefined || baseData.type !== AccountType.Price) {
        throw new Error('Account ' + priceAccounts[i].toBase58() + ' is not a price account')
      }

      const priceData = parsePriceData(accInfo.data, currentSlot)
      priceDatas.push(priceData)
    }

    return priceDatas
  }
}
