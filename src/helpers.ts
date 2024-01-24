import * as fs from "fs";
import {
  type Cluster,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

import {
  type GenericFile,
  type KeypairSigner,
  type Umi,
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
} from "@metaplex-foundation/umi";
import { CLUSTERS, DEFAULT_CLUSTER } from "./const";

export function getCluster(): Cluster {
  const parsedCluster = process.env.CLUSTER as Cluster | undefined;

  if (!parsedCluster) {
    return DEFAULT_CLUSTER;
  }

  if (!CLUSTERS.includes(parsedCluster)) {
    throw new Error(`Cluster ${parsedCluster} not supported`);
  }

  return parsedCluster;
}

export async function getOrGenerateSigner(umi: Umi): Promise<KeypairSigner> {
  const pkPath = `keypair.${getCluster()}.json`;
  const pkFile = Bun.file(pkPath);

  if (pkFile.size === 0) {
    const keypair = generateSigner(umi);
    console.log(`Created a new keypair ${keypair.publicKey} at ${pkPath}`);
    Bun.write(pkPath, JSON.stringify(Array.from(keypair.secretKey)));
    return keypair;
  }

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(await pkFile.json())
  );

  console.log(`Loaded an existing ${keypair.publicKey} from ${pkPath}`);

  return createSignerFromKeypair(umi, keypair);
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

export async function createGenericFileFromPath(
  path: string
): Promise<GenericFile> {
  const file = Bun.file(path);
  const name = path.split("/").pop()!;

  const arrbuf = await file.arrayBuffer();
  return createGenericFile(Buffer.from(arrbuf), name);
}
