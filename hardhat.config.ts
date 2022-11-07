import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@sebasgoldberg/hardhat-wsprovider";

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

const {
  PRIVATE_KEY = '',

  GOERLI_URL_NET = '',
  GOERLI_API_KEY = '',

  POLYGON_URL_NET = '',
  POLYGON_API_KEY = '',

  MAINNET_URL_NET = '',
  MAINNET_API_KEY = '',

  TEST_BSC_URL_NET = '',

  COINMARKETCAP_API_KEY = '',

  GAS_REPORT = false,
  TEST_GAS = false,
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },

  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    goerli: {
      url: GOERLI_URL_NET + GOERLI_API_KEY,
      accounts: [PRIVATE_KEY],
    },
    testBsc: {
      url: TEST_BSC_URL_NET,
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: POLYGON_URL_NET + POLYGON_API_KEY,
      accounts: [PRIVATE_KEY],
    },
    // mainnet: {
    //   url: MAINNET_URL_NET + MAINNET_API_KEY,
    //   accounts: [MAINNET_PRIVATE_KEY],
    // },
  },

  paths: {
    tests: TEST_GAS ? './gas' : './test',
  },

  gasReporter: {
    enabled: GAS_REPORT ? true : false,
    showTimeSpent: true,
    showMethodSig: true,
    onlyCalledMethods: true,
    // currency: "RUB",
    coinmarketcap: COINMARKETCAP_API_KEY,
    // noColors: true,
    // gasPrice: 15,
    // excludeContracts: ['Migrations.sol', 'Wallets/'],
    // src: './contracts/',
  },
};

export default config;
