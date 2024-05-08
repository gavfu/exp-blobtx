import 'dotenv/config';

import * as cKzg from 'c-kzg';
import { createWalletClient, http, setupKzg, parseGwei, stringToHex, toBlobs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnetTrustedSetupPath } from 'viem/node';

import { sepolia, mainnet } from 'viem/chains';

async function expBlobs() {
  const account = privateKeyToAccount(`0x${process.env.BLOB_TX_SENDER || ''}`);
  console.log(`Account: ${account.address}`);

  const kzg = setupKzg(cKzg, mainnetTrustedSetupPath);
  const blobs = toBlobs({ data: stringToHex('hello world') });

  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http()
  });

  const hash = await client.sendTransaction({
    blobs,
    kzg,
    maxFeePerBlobGas: parseGwei('30'),
    to: '0x0000000000000000000000000000000000000000',
  });
  console.log(`Send blob transaction ${hash}`);
}


async function main() {
  await expBlobs();
}

main();