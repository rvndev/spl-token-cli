import {
  AuthorityType,
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
} from "@solana/spl-token";

import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  ensureSufficientBalance,
  getCluster,
  getOrGenerateKeypair,
} from "./helpers";

async function main(): Promise<void> {
  const cluster = getCluster();
  const wallet = getOrGenerateKeypair(`payer.${cluster}.json`);
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

  console.log(`Succesfully connected to cluster ${cluster}`);

  await ensureSufficientBalance(
    connection,
    wallet.publicKey,
    0.1 * LAMPORTS_PER_SOL
  );

  const mintAddress = await createMint(
    connection,
    wallet,
    wallet.publicKey,
    null,
    9 // decimals
  );

  console.log(
    `Created a new SPL token under address: ${mintAddress.toBase58()}`
  );

  const { address: tokenAccountAddress } =
    await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mintAddress,
      wallet.publicKey
    );

  console.log(
    `Created a new token account ${tokenAccountAddress.toBase58()} for token ${mintAddress.toBase58()}`
  );

  const tokenAccountInfoBeforeMint = await getAccount(
    connection,
    tokenAccountAddress
  );

  console.log(`Current token balance: ${tokenAccountInfoBeforeMint.amount}`); // outputs the balance

  const mintAmount = 1_000_000;
  await mintTo(
    connection,
    wallet,
    mintAddress,
    tokenAccountAddress,
    wallet,
    1_000_000 * LAMPORTS_PER_SOL // because decimals are set to 9
  );

  const tokenAccountInfoAfterMint = await getAccount(
    connection,
    tokenAccountAddress
  );
  console.log(`Minting ${mintAmount} tokens`);

  console.log(`Current token balance: ${tokenAccountInfoAfterMint.amount}`); // outputs the balance

  await setAuthority(
    connection,
    wallet,
    mintAddress,
    wallet,
    AuthorityType.MintTokens,
    null // this sets the mint authority to null so nobody can mint
  );

  console.log(`Disabled further mints`);
}
main().then(() => process.exit(0));
