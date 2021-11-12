import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";
import { Product, PriceData, parseProductData, parsePriceData, parseBaseData, AccountType } from ".";

const ONES = '1111111111111111111111111111111';

interface PriceRawData {
    key: PublicKey;
    account: AccountInfo<Buffer>;
}

export interface PythHttpClientResult {
    assetTypes: string[];
    symbols: string[];
    products: Product[];
    productFromSymbol: Map<string, Product>;
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

    constructor(connection: Connection, pythProgramKey: PublicKey, commitment: Commitment = 'finalized') {
        this.connection = connection;
        this.pythProgramKey = pythProgramKey;
        this.commitment = commitment;
    }

    /*
    * Get Pyth Network account information and return actual price state.
    * The result contains lists of asset types, product symbols and their prices.
    */
    public async getData(): Promise<PythHttpClientResult> {
        const assetTypes = new Set<string>();
        const productSymbols = new Set<string>();
        const products = new Set<Product>()
        const productFromSymbol = new Map<string, Product>()
        const productPrice = new Map<string, PriceData>()
        const prices = new Array<PriceData>();

        // Retrieve data from blockchain
        const accountList = await this.connection.getProgramAccounts(this.pythProgramKey, this.commitment);
        
        // Popolate producs and prices
        const priceDataQueue = new Array<PriceData>();
        const productAccountKeyToProduct = new Map<string, Product>();

        accountList.forEach(singleAccount => {
            const base = parseBaseData(singleAccount.account.data);
            if(base) {
                switch (AccountType[base.type]) {
                    case 'Mapping':
                        // We can skip these because we're going to get every account owned by this program anyway.
                        break;
                    case 'Product':
                        const productData = parseProductData(singleAccount.account.data)

                        productAccountKeyToProduct.set(singleAccount.pubkey.toBase58(), productData.product)
                        assetTypes.add(productData.product.asset_type);
                        productSymbols.add(productData.product.symbol);
                        products.add(productData.product);
                        productFromSymbol.set(productData.product.symbol, productData.product);
                        break;
                    case 'Price':
                        const priceData = parsePriceData(singleAccount.account.data)     
                        priceDataQueue.push(priceData)
                        break;
                    case 'Test':
                        break;
                    default:
                        throw new Error(`Unknown account type: ${base.type}. Try upgrading pyth-client.`)
                }    
            }
        });

        priceDataQueue.forEach(priceData => {
            const product = productAccountKeyToProduct.get(priceData.productAccountKey.toBase58())
            
            if(product) {
                productPrice.set(product.symbol, priceData);
                prices.push(priceData);
            }
        });

        const result: PythHttpClientResult = {
            assetTypes: Array.from(assetTypes),
            symbols: Array.from(productSymbols),
            products: Array.from(products),
            productFromSymbol: productFromSymbol,
            productPrice: productPrice,
            prices: prices                   
        };

        return result;
    }
}