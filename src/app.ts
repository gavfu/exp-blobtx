import 'dotenv/config';

import * as cKzg from 'c-kzg';
import { createPublicClient, createWalletClient, http, setupKzg, parseGwei, stringToHex, toBlobs, parseTransaction } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
// import { mainnetTrustedSetupPath } from 'viem/node';
import { sepolia, mainnet } from 'viem/chains';

const mainnetTrustedSetupPath = './src/trusted-setups/viem-mainnet.json';

async function expBlobs() {
  const account = privateKeyToAccount(`0x${process.env.BLOB_TX_SENDER || ''}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://rpc-sepolia.ethda.io`)
  });
  const transactionCount = await publicClient.getTransactionCount({  
    address: account.address
  });
  console.log(`Account: ${account.address}, transaction count: ${transactionCount}`);
  // const gasPrice = await publicClient.getGasPrice();
  const maxPriorityFeePerGas = await publicClient.estimateMaxPriorityFeePerGas();
  const blobBaseFee = await publicClient.getBlobBaseFee();
  console.log(`Blob base fee: ${blobBaseFee}`);

  const kzg = setupKzg(cKzg, mainnetTrustedSetupPath);
  const blobs = toBlobs({ data: stringToHex('hello world') });
  const client = createWalletClient({
    account,
    chain: sepolia,
    // transport: http(`https://rpc-sepolia.ethda.io`)
    transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || ''}`)
  });

  const hash = await client.sendTransaction({
    account,
    // nonce: transactionCount,
    chain: sepolia,
    blobs,
    kzg,
    to: '0x0000000000000000000000000000000000000000',
    // maxFeePerBlobGas: parseGwei('100'),
    maxFeePerBlobGas: blobBaseFee * 120n / 100n,
    maxPriorityFeePerGas: maxPriorityFeePerGas * 120n / 100n
  });
  console.log(`Send blob transaction ${hash}`);
}

async function expBlobsSignAndSend() {
  const account = privateKeyToAccount(`0x${process.env.BLOB_TX_SENDER || ''}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://rpc-sepolia.ethda.io`)
  });
  const transactionCount = await publicClient.getTransactionCount({  
    address: account.address
  });
  console.log(`Account: ${account.address}, transaction count: ${transactionCount}`);
  const maxPriorityFeePerGas = await publicClient.estimateMaxPriorityFeePerGas();
  const blobBaseFee = await publicClient.getBlobBaseFee();
  console.log(`Blob base fee: ${blobBaseFee}`);

  const kzg = setupKzg(cKzg, mainnetTrustedSetupPath);
  const blobs = toBlobs({ data: stringToHex('hello world') });
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || ''}`)
  });

  const request = await client.prepareTransactionRequest({
    account,
    chain: sepolia,
    blobs,
    kzg,
    to: '0x0000000000000000000000000000000000000000',
    maxFeePerBlobGas: blobBaseFee * 120n / 100n,
    maxPriorityFeePerGas: maxPriorityFeePerGas * 120n / 100n,
    // data: '0xaaaa'
  });
  const serializedTransaction = await client.signTransaction(request);

  // Optional: convert to human-readable transaction and print
  const transaction = parseTransaction(serializedTransaction);
  console.log(transaction);
   
  const hash = await client.sendRawTransaction({ serializedTransaction });
  console.log(`Send blob transaction ${hash}`);
}


async function main() {
  // await expBlobs();
  await expBlobsSignAndSend();
}

main();