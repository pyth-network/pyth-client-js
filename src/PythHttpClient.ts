import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";
import { Product, PriceData, parseProductData, parsePriceData, parseBaseData, AccountType } from ".";

const ONES = '1111111111111111111111111111111';

interface PriceRawData {
    key: PublicKey;
    account: AccountInfo<Buffer>;
}

export interface PythHttpClientResult {
    assetsTypes: string[];
    productsSymbols: string[];
    products: Product[];
    productPrice: Map<string, PriceData>;
    prices: PriceData[];
}

/**
 * Reads Pyth price data from a solana web3 connection. This class uses a single HTTP call.
 * Use the method getData() to get updated prices values.
 */
export class PythHttpClient {
    connection: Connection;
    pythProgramKey: PublicKey;
    commitment: Commitment;

    private productAccountKeyToProduct: Record<string, Product>;
    private priceQueue: PriceRawData[];
    private assetTypes: Set<string>;
    private productSymbols: Set<string>;
    private products: Set<Product>;
    private productPrice: Map<string, PriceData>;
    private prices: PriceData[];
    public priceAccountKeyToProductAccountKey: Record<string, string>;

    constructor(connection: Connection, pythProgramKey: PublicKey, commitment: Commitment = 'finalized') {
        this.connection = connection;
        this.pythProgramKey = pythProgramKey;
        this.commitment = commitment;

        this.productAccountKeyToProduct = {};
        this.priceAccountKeyToProductAccountKey = {}

        this.assetTypes = new Set();
        this.productSymbols = new Set();
        this.products = new Set();
        this.productPrice = new Map<string, PriceData>();
        this.prices = [];

        this.priceQueue = [];
    }

    private handleProductAccount(key: PublicKey, account: AccountInfo<Buffer>) {
        const {priceAccountKey, type, product} = parseProductData(account.data)
        this.productAccountKeyToProduct[key.toString()] = product
        if (priceAccountKey.toString() !== ONES) {
            this.priceAccountKeyToProductAccountKey[priceAccountKey.toString()] = key.toString()
        }

        this.assetTypes.add(product.asset_type);
        this.productSymbols.add(product.symbol);
        this.products.add(product);
    }

    private handlePriceAccount(key: PublicKey, account: AccountInfo<Buffer>) {
        const product = this.productAccountKeyToProduct[this.priceAccountKeyToProductAccountKey[key.toString()]]
        if (product === undefined) {
            // This shouldn't happen since we're subscribed to all of the program's accounts,
            // but let's be good defensive programmers.
            throw new Error('Got a price update for an unknown product. This is a bug in the library, please report it to the developers.')
        }

        const priceData = parsePriceData(account.data)     
        this.productPrice.set(product.symbol, priceData);
        this.prices.push(priceData);
    }    

    private handleAccount(key: PublicKey, account: AccountInfo<Buffer>) {
        const base = parseBaseData(account.data)
        // The pyth program owns accounts that don't contain pyth data, which we can safely ignore.
        if (base) {
            switch (AccountType[base.type]) {
                case 'Mapping':
                    // We can skip these because we're going to get every account owned by this program anyway.
                    break;
                case 'Product':
                    this.handleProductAccount(key, account)
                    break;
                case 'Price':
                    this.priceQueue.push({
                        key: key,
                        account: account
                    });
                    break;
                case 'Test':
                    break;
                default:
                    throw new Error(`Unknown account type: ${base.type}. Try upgrading pyth-client.`)
            }
        }
    }

    /*
    * Get Pyth Network account information and return actual price state.
    * The result contains lists of asset types, product symbols and their prices.
    */
    public async getData(): Promise<PythHttpClientResult> {
        this.productAccountKeyToProduct = {}
        this.priceAccountKeyToProductAccountKey = {}

        this.assetTypes = new Set();
        this.productSymbols = new Set();
        this.products = new Set()
        this.productPrice = new Map<string, PriceData>()
        this.prices = [];

        const accounts = await this.connection.getProgramAccounts(this.pythProgramKey, this.commitment);
        for(const account of accounts) {
            this.handleAccount(account.pubkey, account.account)
        }

        for(const queued of this.priceQueue) {
            this.handlePriceAccount(queued.key, queued.account);
        }
        this.priceQueue = [];

        const result: PythHttpClientResult = {
            assetsTypes: Array.from(this.assetTypes),
            productsSymbols: Array.from(this.productSymbols),
            products: Array.from(this.products),
            productPrice: this.productPrice,
            prices: this.prices                   
        };

        return result;
    }
}