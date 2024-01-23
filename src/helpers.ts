import {
  Connection,
  Keypair,
  PublicKey,
  type Cluster,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as fs from "fs";

export function getCluster(): Cluster {
  const parsedCluster = process.env.CLUSTER;

  if (!parsedCluster) {
    return "devnet";
  }
  if (!["devnet", "testnet", "mainnet-beta"].includes(parsedCluster)) {
    throw new Error(`Cluster ${parsedCluster} not supported`);
  }

  return parsedCluster as Cluster;
}

export function getOrGenerateKeypair(privateKeyPath: string): Keypair {
  if (!fs.existsSync(privateKeyPath)) {
    const keypair = Keypair.generate();
    fs.writeFileSync(privateKeyPath, keypair.secretKey);
    return keypair;
  }

  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(privateKeyPath, "utf-8")))
  );
}

function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export async function ensureSufficientBalance(
  connection: Connection,
  publicKey: PublicKey,
  minimumBalance: number
): Promise<void> {
  const balance = (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;

  if (balance > minimumBalance) {
    return;
  }

  if (getCluster() === "mainnet-beta") {
    throw new Error(
      `Balance ${balance / LAMPORTS_PER_SOL} SOL too low (${
        minimumBalance / LAMPORTS_PER_SOL
      } SOL required)`
    );
  }

  console.log(`Requesting airdrop...`);
  await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
}
