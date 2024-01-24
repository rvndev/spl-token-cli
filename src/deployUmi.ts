import { createGenericFile, keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { clusterApiUrl } from "@solana/web3.js";
import { CLUSTER_IRYS_MAP } from "./const";
import {
  createGenericFileFromPath,
  getCluster,
  getOrGenerateSigner,
} from "./helpers";

async function main(): Promise<void> {
  const cluster = getCluster();

  const umi = createUmi(clusterApiUrl(cluster)).use(
    irysUploader({
      address: CLUSTER_IRYS_MAP[cluster],
    })
  );

  console.log(`Succesfully connected to Solana ${cluster} cluster`);

  const signer = await getOrGenerateSigner(umi);
  
  umi.use(keypairIdentity(signer));

  const image = await createGenericFileFromPath("metadata/image.jpeg");

  const imageUri = umi.uploader.upload([image]);

  console.log(imageUri);
}

main().then(() => process.exit(0));
