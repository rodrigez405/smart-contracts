# Arttaca Marketplace Smart Contracts

This repository contains the smart contracts for Arttaca Marketplace, including the likes of:

* Collections: for storing information about NFTs and Semi-Fungible tokens (ERC721 and ERC1155)
* Marketplace: responsible for exchange, sales, auctions, and others

## About the source code

The source code in this repo has been created from scratch but uses OpenZeppelin standard libraries for safety in basic operations and validations.

- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Getting Started

### Requirements
You will need node.js (16.x) and npm installed to run it locally. We are using Hardhat to handle the project configuration and deployment. The configuration file can be found as `hardhat.config.js`.

1. Import the repository and `cd` into the new directory.
2. Run `npm ci`.
3. Copy the file `.env.example` to `.env`, and:
   - Replace `PRIVATE_KEY` with the private key of your deployer account.
   - Replace `RPC_URL` with an INFURA or ALCHEMY url.
5. Make sure you have gas to run the transactions and deploy the contracts in the account you define.
6. Define the network where you want to deploy it in `hardhat.config.js`.

## Usage

`npx hardhat compile` to compile the contracts

`npx hardhat test` to run tests

`npx hardhat run scripts/deploy.ts --network ${network}` to deploy to a specific network

Other useful commands:

```shell
npx hardhat coverage
```

## Troubleshooting

If you have any questions, send them along with a hi to [hello@dandelionlabs.io](mailto:hello@dandelionlabs.io).

## License

Smart contracts for Arttaca Marketplace are available under the [MIT License](LICENSE.md).
