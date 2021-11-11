import { AccountInfo, Cluster, clusterApiUrl, Commitment, Connection, PublicKey } from "@solana/web3.js";
import { Product, PriceData, getPythProgramKeyForCluster, parseProductData, parsePriceData, parseBaseData, AccountType } from ".";

const ONES = '1111111111111111111111111111111';

interface PriceRawData {
    key: PublicKey;
    account: AccountInfo<Buffer>;
}

/**
 * Reads Pyth price data from a solana web3 connection. This class uses a single HTTP call.
 * Use the method refreshData() to update prices values.
 */
export class PythNetworkHTTPClient {
    private _program_key: PublicKey;
    private _commitment: Commitment;
    private _cluster: Cluster;
    private _price_queue: PriceRawData[];
    private productAccountKeyToProduct: Record<string, Product>;
    private _asset_types: Set<string>;
    private _product_symbols: Set<string>;
    private _products: Set<Product>;
    private _product_price: Map<Product, PriceData>;
    public priceAccountKeyToProductAccountKey: Record<string, string>;

    constructor(cluster_name: Cluster, commitment: Commitment = 'finalized') {
        this._program_key = getPythProgramKeyForCluster(cluster_name)        
        this._commitment = commitment;
        this._cluster = cluster_name;
        this._price_queue = [];
        this.productAccountKeyToProduct = {};
        this._asset_types = new Set();
        this._product_symbols = new Set();
        this._products = new Set();
        this._product_price = new Map<Product, PriceData>();
        this.priceAccountKeyToProductAccountKey = {}

    }

    private handleProductAccount(key: PublicKey, account: AccountInfo<Buffer>) {
        const {priceAccountKey, type, product} = parseProductData(account.data)
        this.productAccountKeyToProduct[key.toString()] = product
        if (priceAccountKey.toString() !== ONES) {
            this.priceAccountKeyToProductAccountKey[priceAccountKey.toString()] = key.toString()
        }

        this._asset_types.add(product.asset_type);
        this._product_symbols.add(product.symbol);
        this._products.add(product);
    }

    private handlePriceAccount(key: PublicKey, account: AccountInfo<Buffer>) {
        const product = this.productAccountKeyToProduct[this.priceAccountKeyToProductAccountKey[key.toString()]]
        if (product === undefined) {
            // This shouldn't happen since we're subscribed to all of the program's accounts,
            // but let's be good defensive programmers.
            throw new Error('Got a price update for an unknown product. This is a bug in the library, please report it to the developers.')
        }

        const priceData = parsePriceData(account.data)     
        this._product_price.set(product, priceData);
    }    

    private handleAccount(key: PublicKey, account: AccountInfo<Buffer>, productOnly: boolean) {
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
                    if (!productOnly) {
                        this.handlePriceAccount(key, account)
                    } else {
                        this._price_queue.push({
                            key: key,
                            account: account
                        });
                    }
                    break;
                case 'Test':
                    break;
                default:
                    throw new Error(`Unknown account type: ${base.type}. Try upgrading pyth-client.`)
            }
        }
    }

    public async refreshData() {
        const require_https = this._cluster === 'mainnet-beta' ? true : false;
        const current_connection = new Connection(clusterApiUrl(this._cluster, require_https));

        const accounts = await current_connection.getProgramAccounts(this._program_key, this._commitment);
        for(const account of accounts) {
            this.handleAccount(account.pubkey, account.account, true)
        }

        for(const queued of this._price_queue) {
            this.handleAccount(queued.key, queued.account, false)
        }
    }

    public assetsTypesKeys(): string[] {
        return Array.from(this._asset_types);
    }

    public productsSymbolsKeys(): string[] {
        return Array.from(this._product_symbols);
    }

    public producsWithAssetType(asset_type: string): Product[] {
        if(!this._asset_types.has(asset_type))
            return [];
        
        const result: Product[] = [];
        this._products.forEach(current_product => {
            if(current_product.asset_type === asset_type) {
                result.push(current_product)
            }
        });

        return result;
    }

    public producsWithSymbol(product_symbol: string): Product[] {
        if(!this._product_symbols.has(product_symbol)) {
            return [];
        }
        
        const result: Product[] = [];
        this._products.forEach(current_product => {
            if(current_product.symbol === product_symbol) {
                result.push(current_product)
            }
        });

        return result;
    }

    public getProductPrice(product: Product): PriceData | undefined {
        const result = this._product_price.get(product);

        if(result === null)
            return undefined;

        return result;
    }
}