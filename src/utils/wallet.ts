import { createWalletClient, http } from "viem";
import { HDAccount, PrivateKeyAccount } from "viem/accounts";
import { getChain } from "../config";

export default (account: HDAccount | PrivateKeyAccount) => {
  const client = createWalletClient({
    account,
    chain: getChain(),
    transport: http(),
  });
  return client;
};
