import { privateKeyToAccount } from "viem/accounts";
import config from "./config";
import { PrivateKeyAccount, parseGwei, parseEther } from "viem";
import createViemClient from "./utils/client";
import createWallet from "./utils/wallet";
import { wagmiContract } from "./abi";

const publicClient = createViemClient();
const account = privateKeyToAccount(`0x${config.PRIVATE_KEY}`);
const walletClient = createWallet(account);
const functionName = "mint";

interface txParams {
  account: PrivateKeyAccount;
  address: `0x${string}`;
  abi: any;
  functionName: string;
  gas?: bigint;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
  nonce?: number;
}

interface sendTxParams {
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
  nonce?: number;
}

const buildParams = ({
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
  gasPrice,
  nonce,
}: sendTxParams): txParams => {
  const params: txParams = {
    account,
    address: wagmiContract.address,
    abi: wagmiContract.abi,
    functionName,
  };
  console.log("--------------------------------");

  // The gas limit for the transaction. Note that passing a gas limit also skips the gas estimation step.
  if (gasLimit) {
    console.log("gasLimit used:             ", gasLimit);
    params.gas = gasLimit;
  }

  // Total fee per gas (in wei), inclusive of maxPriorityFeePerGas. Only applies to EIP-1559 Transactions
  // It cant be lower than base fee
  if (maxFeePerGas) {
    console.log("maxFeePerGas used:         ", maxFeePerGas);
    params.maxFeePerGas = maxFeePerGas;
  }

  // Max priority fee per gas (in wei). Only applies to EIP-1559 Transactions
  if (maxPriorityFeePerGas) {
    console.log("maxPriorityFeePerGas used: ", maxPriorityFeePerGas);
    params.maxPriorityFeePerGas = maxPriorityFeePerGas;
  }

  // The price (in wei) to pay per gas. Only applies to Legacy Transactions.
  // it cant be used with EIP1559 params
  if (gasPrice) {
    console.log("gasPrice used: ", gasPrice);
    params.gasPrice = gasPrice;
  }

  // Unique number identifying this transaction.
  if (nonce) {
    console.log("nonce used: ", nonce);
    params.nonce = nonce;
  }

  return params;
};

const sendTransaction = async ({
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
  gasPrice,
  nonce,
}: sendTxParams) => {
  const params: txParams = buildParams({
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    nonce,
  });

  const txHash = await walletClient.writeContract(params as any);
  console.log("--------------------------------");
  console.log("txHash", txHash);
  console.log(`https://mumbai.polygonscan.com/tx/${txHash}`);
  return txHash;
};

const simulateTransaction = async ({
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
  gasPrice,
  nonce,
}: sendTxParams) => {
  const params: txParams = buildParams({
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    nonce,
  });

  const { request } = await publicClient.simulateContract(params as any);
  console.log("--------------------------------");
  console.log("gas used in simulate operation: ", request["gas"]);
  return request;
};

const getEstimations = async (
  functionName:
    | "mint"
    | "approve"
    | "safeTransferFrom"
    | "setApprovalForAll"
    | "transferFrom"
) => {
  const estimatedGas: bigint = await publicClient.estimateContractGas({
    address: wagmiContract.address,
    abi: wagmiContract.abi,
    functionName,
    account: account.address,
  });

  const { maxFeePerGas, maxPriorityFeePerGas } =
    await publicClient.estimateFeesPerGas();

  console.log("--------------------------------");
  console.log(`Estimated units of gas for mint function: ${estimatedGas}`);
  console.log(`Estimated maxFeePerGas:                   ${maxFeePerGas}`);
  console.log(`Estimated maxPriorityFeePerGas:           ${maxPriorityFeePerGas}`);

  return {
    estimatedGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
};

const sendTxWithLowerFee = async () => {
  const maxPriorityFeePerGas: bigint = 1n;
  const maxFeePerGas: bigint = maxPriorityFeePerGas + 14n;

  const { estimatedGas } = await getEstimations(functionName);
  try {
    await simulateTransaction({
      gasLimit: estimatedGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    const tx = await sendTransaction({
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
    return tx;
  } catch (err: any) {
    if (err["details"]) {
      console.log(err["details"]);
    } else if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
};

const sendTxWithEstimatedFees = async () => {
  const { estimatedGas, maxFeePerGas, maxPriorityFeePerGas } =
    await getEstimations(functionName);
  try {
    await simulateTransaction({
      gasLimit: estimatedGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    const tx = await sendTransaction({
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
    return tx;
  } catch (err: any) {
    if (err["details"]) {
      console.log(err["details"]);
    } else if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
};

const sendTxWithWithUsedNonce = async (nonce: number) => {
  const { estimatedGas, maxFeePerGas, maxPriorityFeePerGas } =
    await getEstimations(functionName);
  try {
    await simulateTransaction({
      gasLimit: estimatedGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
    });

    const tx = await sendTransaction({
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
    });
    return tx;
  } catch (err: any) {
    if (err["details"]) {
      console.log(err["details"]);
    } else if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
};

const getTxInfo = async (hash: `0x${string}`) => {
  const txData = await publicClient.getTransaction({
    hash: hash,
  });

  console.log("txData: ", txData);
  console.log(`https://mumbai.polygonscan.com/tx/${hash}`);
  return txData;
};

const getCurrentNonce = async (address: `0x${string}`) => {
  const transactionCount = await publicClient.getTransactionCount({
    address,
  });
  console.log(`Current nonce for address ${address}: ${transactionCount}`);
  return transactionCount;
};

const calculateMarginFee = async () => {
  const { estimatedGas, maxFeePerGas, maxPriorityFeePerGas } =
    await getEstimations(functionName);

  const maxPriorityFeeSafetyMargin = 1.2;
  const precision = 100;
  const maxPriorityFeeDefault = parseGwei("2");

  const maxPriorityFeeCalculated =
    (maxPriorityFeePerGas! * BigInt(precision * maxPriorityFeeSafetyMargin)) /
    BigInt(precision);
  console.log(`\nEstimated maxPriorityFeePerGas: ${maxPriorityFeePerGas}`);
  console.log(`Safety margin 20 %:             ${maxPriorityFeeCalculated}`);
  console.log(`Default maxPriorityFeePerGas:   ${maxPriorityFeeDefault}`);

  // We select the greater tip between the default and the safety margin
  const maxPriorityFee =
    maxPriorityFeeCalculated > maxPriorityFeeDefault
      ? maxPriorityFeeCalculated
      : maxPriorityFeeDefault;
  console.log(`MaxPriorityFee selected:        ${maxPriorityFee}`);

  const maxFeeSafetyMargin = 1.2;
  const maxFeeDefault = maxPriorityFee + 1n;
  const maxFeeCalculated =
    (maxFeePerGas! * BigInt(precision * maxFeeSafetyMargin)) /
    BigInt(precision);
  console.log(`\nEstimated maxFeePerGas: ${maxFeePerGas}`);
  console.log(`Safety margin 20 %:     ${maxFeeCalculated}`);
  console.log(`Default maxFeeDefault:  ${maxFeeDefault}`);

  // We select the greater fee between the default (tip + 1) and the safety margin
  const maxFee =
    maxFeeCalculated > maxFeeDefault ? maxFeeCalculated : maxFeeDefault;
  console.log(`MaxFee selected:        ${maxFee}`);

  const gasLimitSafetyMargin = 1.2;
  const estimateGasCalculated =
    (estimatedGas! * BigInt(precision * gasLimitSafetyMargin)) /
    BigInt(precision);
  console.log(`\nEstimated gas:      ${estimatedGas}`);
  console.log(`Safety margin 20 %: ${estimateGasCalculated}`);

  return {
    maxFeePerGas: maxFee,
    maxPriorityFeePerGas: maxPriorityFee,
    gasLimit: estimateGasCalculated,
  };
};

const sendSecureTx = async () => {
  const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } =
    await calculateMarginFee();

  const tx = await sendTransaction({
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
  });

  return tx;
};

const checkBalanceBeforeSendTx = async () => {
  const { maxFeePerGas, gasLimit } = await calculateMarginFee();

  try {
    const txFee = maxFeePerGas * gasLimit;
    const currentBalance = await checkBalance(walletClient.account.address);
    const lowBalanceThreshold = parseEther("0.3");

    if (currentBalance! < lowBalanceThreshold) {
      console.log("Balance is already below the threshold");
    }

    if (currentBalance! - txFee < lowBalanceThreshold) {
      console.log("Balance will be below the threshold after the tx");
    }
  } catch (err: any) {
    if (err["details"]) {
      console.log(err["details"]);
    } else if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
};

const checkBalance = async (address: `0x${string}`) => {
  const balance = await publicClient.getBalance({ address });
  console.log("\nbalance", balance);
  return balance;
};

const sendTxWithGasPrice = async () => {
  try {
    await simulateTransaction({
      gasPrice: 5n,
    });

    const tx = await sendTransaction({
      gasPrice: 5n,
    });
    return tx;
  } catch (err: any) {
    if (err["details"]) {
      console.log(err["details"]);
    } else if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
};

const main = async () => {
  // User wallet:      0xbB7dB6f75E9580a261C47ACf2d39CF7a674ccFc1
  // Contract address: 0x9242fda4882285a6dd412ba556d8ecdf9f994d78

  // await sendTxWithLowerFee();

  // const txHash = '0x6d6ad6daaade6dc1beaf916d15cddbe5f4c96d2fa5bc6f5d5177ef596e0eba62';
  // await getTxInfo(txHash);

  // await sendTxWithEstimatedFees();

  // const txHash = '0xec200c932a1dd70b32897bb0241d7d8161841f2568de44f4d888f01983d18c9c';
  // await getTxInfo(txHash);

  // await getCurrentNonce(walletClient.account.address);

  // await sendTxWithWithUsedNonce(32);

  // await sendSecureTx();

  // await checkBalance(walletClient.account.address)

  // await sendTxWithGasPrice();

  // await checkBalanceBeforeSendTx();
};

main();
