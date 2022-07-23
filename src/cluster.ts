import { Cluster, clusterApiUrl, PublicKey } from '@solana/web3.js'

export type PythCluster = Cluster | 'pythtest'

/** Mapping from solana clusters to the public key of the pyth program. */
const clusterToPythProgramKey: Record<PythCluster, string> = {
  'mainnet-beta': 'FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH',
  devnet: 'gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s',
  testnet: '8tfDNiaEyrV6Q1U4DEXrEigs9DoDtkugzFbybENEbCDz',
  pythtest: '8tfDNiaEyrV6Q1U4DEXrEigs9DoDtkugzFbybENEbCDz',
}

/** Gets the public key of the Pyth program running on the given cluster. */
export function getPythProgramKeyForCluster(cluster: PythCluster): PublicKey {
  if (clusterToPythProgramKey[cluster] !== undefined) {
    return new PublicKey(clusterToPythProgramKey[cluster])
  } else {
    throw new Error(
      `Invalid Solana cluster name: ${cluster}. Valid options are: ${JSON.stringify(
        Object.keys(clusterToPythProgramKey),
      )}`,
    )
  }
}

/** Retrieves the RPC API URL for the specified Pyth cluster  */
export function getPythClusterApiUrl(cluster: PythCluster): string {
  // TODO: Add pythnet when it's ready
  if (cluster === 'pythtest') {
    return 'https://api.pythtest.pyth.network'
  } else {
    return clusterApiUrl(cluster)
  }
}
