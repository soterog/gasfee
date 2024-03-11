import { createPublicClient, http } from 'viem';
import { getChain } from '../config';

export default () => createPublicClient({
  chain: getChain(),
  transport: http(),
});