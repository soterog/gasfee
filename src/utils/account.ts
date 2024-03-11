import {
  HDAccount,
  PrivateKeyAccount,
  privateKeyToAccount,
  mnemonicToAccount,
} from "viem/accounts";
import config from "../config";

export default (privateKey?: `0x${string}`) => {
  let account: HDAccount | PrivateKeyAccount;

  if (privateKey) {
    account = privateKeyToAccount(privateKey);
  } else {
    account = mnemonicToAccount(config.MNEMONIC);
  }
  return account;
};
