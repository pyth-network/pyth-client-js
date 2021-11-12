import { clusterApiUrl, Connection } from "@solana/web3.js";
import { getPythProgramKeyForCluster, PythNetworkHTTPClient } from "..";

test('PythNetworkHTTPClientCall', done => {
    jest.setTimeout(20000)
    try {
        const programKey = getPythProgramKeyForCluster('testnet');
        const currentConnection = new Connection(clusterApiUrl('testnet'));
        const pyth_client = new PythNetworkHTTPClient(currentConnection, programKey);
        pyth_client.getData().then(
            value => {
                try {
                    console.log("products number: ", Object.keys(pyth_client.priceAccountKeyToProductAccountKey).length)
                    console.log("asset types: ", pyth_client.assetsTypes());
                    console.log("asset symbols: ", pyth_client.productsSymbols());
                    const products = pyth_client.productsWithSymbol("SOL/USD");
                    expect(products.length).toBeGreaterThan(0);
    
                    const price = pyth_client.getProductPrice(products[0].symbol);
                    expect(price).toBeDefined();
    
                    console.log("products", products)
                    console.log("price", price)
    
                    done()    
                } catch (cerr) {
                    done(cerr)
                }
            }, 
            err => done(err)
        )
    } catch(err_catch) {
        done(err_catch);
    }
});