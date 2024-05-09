import 'dotenv/config';

import * as cKzg from 'c-kzg';
import { createPublicClient, createWalletClient, http, setupKzg, parseGwei, stringToHex, toBlobs, parseTransaction } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
// import { mainnetTrustedSetupPath } from 'viem/node';
import { sepolia, mainnet } from 'viem/chains';

const fs = require('fs');
const mainnetTrustedSetupPath = './src/trusted-setups/viem-mainnet.json';

async function expSimpleBlobTx() {
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

async function expEIP7588() {
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

  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID || ''}`)
  });
  const kzg = setupKzg(cKzg, mainnetTrustedSetupPath);

  const textBlobs = toBlobs({ data: stringToHex('Data availability sampling: each node only needs to download a small portion of the data to verify the availability of the whole thing.') });
  const imgContentBase64 = fs.readFileSync('./src/imgs/das.png').toString('base64');
  const imaData = `data:image/png;base64,${imgContentBase64}`;
  const imgBlobs = toBlobs({ data: stringToHex(imaData) });
  // console.log(imaData);
  // console.log(imgBlobs.length);

  const blobMetadata = {
    originator: "Vitalik Buterin",
    description: "An illustration of data availability sampling",
    blobs: [
      {
        content_type: "text/plain",
        description: "This blob contains a description text of the illustration. It's a hex encoded UTF-8 string."
      },
      {
        content_type: "image/png",
        description: "This blob contains the illustration image data in base64 format. It's a hex encoded RFC 2397 (https://www.rfc-editor.org/rfc/rfc2397) data URL."
      },
    ]
  };
  const blobMetadataString = JSON.stringify(blobMetadata);
  const data = stringToHex(blobMetadataString);
  console.log(data);

  const request = await client.prepareTransactionRequest({
    account,
    chain: sepolia,
    blobs: [textBlobs[0], imgBlobs[0]],
    kzg,
    to: '0x0000000000000000000000000000000000000000',
    maxFeePerBlobGas: blobBaseFee * 120n / 100n,
    maxPriorityFeePerGas: maxPriorityFeePerGas * 120n / 100n,
    data
  });
  const serializedTransaction = await client.signTransaction(request);

  // Optional: convert to human-readable transaction and print
  const transaction = parseTransaction(serializedTransaction);
  console.log(transaction);
   
  const hash = await client.sendRawTransaction({ serializedTransaction });
  console.log(`Send blob transaction ${hash}`);
}

async function main() {
  // await expSimpleBlobTx();
  await expEIP7588();
}

main();