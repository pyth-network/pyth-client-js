import { PythNetworkHTTPClient } from "..";

test('PythNetworkHTTPClientCall', done => {
    jest.setTimeout(20000)
    try {
        const pyth_client = new PythNetworkHTTPClient('testnet');
        pyth_client.refreshData().then(
            value => {
                try {
                    console.log("products number: ", Object.keys(pyth_client.priceAccountKeyToProductAccountKey).length)
                    console.log("asset types: ", pyth_client.assetsTypesKeys());
                    console.log("asset symbols: ", pyth_client.productsSymbolsKeys());
                    const products = pyth_client.producsWithSymbol("SOL/USD");
                    expect(products.length).toBeGreaterThan(0);
    
                    const price = pyth_client.getProductPrice(products[0]);
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