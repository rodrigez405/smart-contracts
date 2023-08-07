import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    sepolia: {
      network: 11155111,
      url: 'https://sepolia.infura.io/v3/9214ea1eb22a4e53b92b958b271248b2',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    mainnet: {
      network: 1,
      url: 'https://mainnet.infura.io/v3/9214ea1eb22a4e53b92b958b271248b2',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    coinmarketcap: 'b5aa6c8e-e54a-4291-b372-6afac549d9fc',
    currency: 'USD',
    enabled: true,
    token: 'ETH'
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY ?? ""
    }
  }
};

export default config;
