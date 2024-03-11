import { config } from "dotenv";
import { goerli, mainnet, polygonMumbai, sepolia } from "viem/chains";

export interface Config {
  CHAIN: string
  PRIVATE_KEY: string;
  MNEMONIC: string;
  PROVIDER: string;
}

config();

export const getChain = () => {
  try {
    let network;
    switch (parsedConfig.CHAIN) {
      case goerli.network:
        network = goerli;
        break;
      case sepolia.network:
        network = sepolia;
        break;
      case mainnet.network:
        network = mainnet;
        break;
      case polygonMumbai.network:
        network = polygonMumbai;
        break;
      default:
        throw `${parsedConfig.CHAIN} unknown chain envvar`;
    };
  
    console.info(`Network selected: ${network.name}`);
    return network;
  } catch (error) {
    console.error('FUNCTION getChain:', error);
  }
};

const parsedConfig: Config = {
  CHAIN: process.env.CHAIN || '',
  PRIVATE_KEY: process.env.PRIVATE_KEY || '',
  MNEMONIC: process.env.MNEMONIC || '',
  PROVIDER: process.env.PROVIDER || '',
};

export default parsedConfig;