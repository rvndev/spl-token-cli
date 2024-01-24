import type { Cluster } from "@solana/web3.js";

export const DEFAULT_CLUSTER: Cluster = "devnet";
export const CLUSTERS: Cluster[] = ["devnet", "testnet", "mainnet-beta"];

export const CLUSTER_IRYS_MAP: Record<Cluster, string> = {
  devnet: "https://devnet.irys.xyz",
  testnet: "https://devnet.irys.xyz",
  "mainnet-beta": "https://node1.irys.xyz",
};
