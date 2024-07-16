import { checkNetwork, getEthereum } from "../utils/ethereum";
import { Contract, ethers, parseUnits } from "ethers";
import { ERC20_ABI } from "./abi/erc20Token";
import { SWAP_ROUTER_ABI } from "./abi/swapRouter";
import { TOKEN_PAIR_ABI } from "./abi/tokenPair";

export const SWAP_ROUTER_ADDRESS = import.meta.env.VITE_SWAP_ROUTER;

export const initTokenContract = async (tokenAddress: string) => {
  const provider = getEthereum();
  const ethersProvider = new ethers.BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  const contract = new Contract(tokenAddress, ERC20_ABI, signer);

  return contract;
};

export const initPairContract = async (pairAddress: string) => {
  const provider = getEthereum();
  const ethersProvider = new ethers.BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  const pairContract = new ethers.Contract(pairAddress, TOKEN_PAIR_ABI, signer);

  return pairContract;
};

export const initSwapContracts = async () => {
  try {
    await checkNetwork();

    const provider = getEthereum();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const swapContract = new ethers.Contract(
      SWAP_ROUTER_ADDRESS,
      SWAP_ROUTER_ABI,
      signer
    );

    return { swapContract };
  } catch (error) {
    console.log(error);
  }
};

export const getFeeData = async () => {
  try {
    const provider = getEthereum();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const feeData = await ethersProvider.getFeeData();

    return feeData;
  } catch (error) {
    console.log(error);
  }
};

export const getExchangeRateByPair = async (
  payAmount: string,
  swapContract: Contract,
  path: string[],
  decimals: number
) => {
  const payValue = parseUnits(payAmount, decimals);
  const quote = await swapContract.getAmountsOut(payValue, path);
  const receiveAmount: bigint = quote[quote.length - 1];

  return receiveAmount;
};

export const doSwap = async (
  amountIn: string,
  amountOutMin: string,
  reserves: string[],
  userAddress: string,
  deadline: number,
  swapContract: Contract,
  decimals: number
) => {
  const params = [
    parseUnits(amountIn, decimals),
    parseUnits(amountOutMin, decimals),
    reserves,
    userAddress,
    deadline,
  ];

  const gas = await swapContract.swapExactTokensForTokens.estimateGas(
    ...params
  );

  const tx = await swapContract.swapExactTokensForTokens(...params, {
    gasLimit: gas,
  });

  return tx;
};

export const addLiquidity = async (
  tokenAddressA: string,
  tokenAddressB: string,
  amountA: string,
  amountB: string,
  amountAMin: string,
  amountBMin: string,
  userAccount: string,
  deadline: number,
  swapContract: Contract,
  decimalsA: number,
  decimalsB: number
) => {
  const params = [
    tokenAddressA,
    tokenAddressB,
    parseUnits(amountA, decimalsA),
    parseUnits(amountB, decimalsB),
    parseUnits(amountAMin, decimalsA),
    parseUnits(amountBMin, decimalsB),
    userAccount,
    deadline,
  ];

  const gas = await swapContract.addLiquidity.estimateGas(...params);

  const tx = await swapContract.addLiquidity(...params, {
    gasLimit: gas,
  });

  return tx;
};
