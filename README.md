# Experience Blob TX with EIP-7588

This repository demonstrates how to send an [EIP-4844](https://www.eip4844.com/) blob transaction to Sepolia with [EIP-7588](https://eips.ethereum.org/EIPS/eip-7588) extension.

The blob transaction will carry two blobs, where the first blob is a text explaining what is "data availability sampling": `Data availability sampling: each node only needs to download a small portion of the data to verify the availability of the whole thing.`, and the second blob is the raw content of a [DAS image](./src/imgs/das.png).

Additionaly, as specified by [EIP-7588](https://eips.ethereum.org/EIPS/eip-7588), the blob transaction's `data` field is attached with a metadata JSON object which provides additional information of the attached blobs:

```json
{
    "originator": "Vitalik Buterin",
    "description": "An illustration of data availability sampling",
    "blobs": [
      {
        "content_type": "text/plain",
        "description": "This blob contains a description text of the illustration. It's a hex encoded UTF-8 string."
      },
      {
        "content_type": "image/png",
        "description": "This blob contains the illustration image data in base64 format. It's a hex encoded RFC 2397 (https://www.rfc-editor.org/rfc/rfc2397) data URL."
      },
    ]
  }
```

## Steps

1. Prepare .env by copying .env-example 

2. Build and Run
  ```sh
  $ yarn
  $ yarn start
  ```

## Reference

For a sample blob tx, see: https://sepolia.etherscan.io/tx/0xc177b7159aba6372bbf296cd7711793324abea797289cf75e72fbd514bd6ce31