import { checkNetwork, getEthereum } from "../utils/ethereum";
import { Contract, ethers, parseEther, parseUnits } from "ethers";
import { ERC20_ABI } from "./abi/erc20Token";
import { SWAP_ROUTER_ABI } from "./abi/swapRouter";
import { TOKEN_PAIR_ABI } from "./abi/tokenPair";

export const SWAP_ROUTER_ADDRESS = import.meta.env.VITE_SWAP_ROUTER;

export const getETHBalance = async (userAccount: string) => {
  const provider = getEthereum();
  const ethersProvider = new ethers.BrowserProvider(provider);
  const balance = await ethersProvider.getBalance(userAccount);

  return balance;
};

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
  decimals: number,
  outDecimals: number,
  nonce: number
) => {
  const params = [
    parseUnits(amountIn, decimals),
    parseUnits(amountOutMin, outDecimals),
    reserves,
    userAddress,
    deadline,
  ];

  const gas = await swapContract.swapExactTokensForTokens.estimateGas(
    ...params
  );

  const tx = await swapContract.swapExactTokensForTokens(...params, {
    gasLimit: gas,
    nonce,
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
  decimalsB: number,
  nonce: number
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
    nonce,
  });

  return tx;
};

export const doSwapETHForTokens = async (
  amountIn: string,
  amountOutMin: string,
  reserves: string[],
  userAddress: string,
  deadline: number,
  swapContract: Contract,
  decimals: number,
  nonce: number
) => {
  const params = [
    parseUnits(amountOutMin, decimals),
    reserves,
    userAddress,
    deadline,
  ];

  const gas = await swapContract.swapExactETHForTokens.estimateGas(...params, {
    value: parseUnits(amountIn, decimals),
  });

  const tx = await swapContract.swapExactETHForTokens(...params, {
    value: parseUnits(amountIn, decimals),
    gasLimit: gas,
    nonce,
  });

  return tx;
};

export const doSwapTokensForETH = async (
  amountOut: string,
  amountInMax: string,
  reserves: string[],
  userAddress: string,
  deadline: number,
  swapContract: Contract,
  decimals: number,
  nonce: number
) => {
  const params = [
    parseUnits(amountOut, decimals),
    parseUnits(amountInMax, decimals),
    reserves,
    userAddress,
    deadline,
  ];

  const gas = await swapContract.swapTokensForExactETH.estimateGas(...params);

  const tx = await swapContract.swapTokensForExactETH(...params, {
    gasLimit: gas,
    nonce,
  });

  return tx;
};

export const addLiquidityETH = async (
  tokenAddressB: string,
  amountETH: string,
  amountB: string,
  amountETHMin: string,
  amountBMin: string,
  userAccount: string,
  deadline: number,
  swapContract: Contract,
  decimalsB: number,
  nonce: number
) => {
  const params = [
    tokenAddressB,
    parseUnits(amountB, decimalsB),
    parseUnits(amountBMin, decimalsB),
    parseEther(amountETHMin),
    userAccount,
    deadline,
  ];

  const gas = await swapContract.addLiquidityETH.estimateGas(...params, {
    value: parseEther(amountETH),
  });

  const tx = await swapContract.addLiquidityETH(...params, {
    value: parseEther(amountETH),
    gasLimit: gas,
    nonce,
  });

  return tx;
};

export const removeLiquidity = async (
  address0: string,
  address1: string,
  liquidity: string,
  amount0Min: string,
  amount1Min: string,
  userAccount: string,
  deadline: number,
  swapContract: Contract,
  decimals0?: number,
  decimals1?: number
) => {
  const params = [
    address0,
    address1,
    parseEther(liquidity),
    parseUnits(amount0Min, decimals0),
    parseUnits(amount1Min, decimals1),
    userAccount,
    deadline,
  ];

  const gas = await swapContract.removeLiquidity.estimateGas(...params);

  const tx = await swapContract.removeLiquidity(...params, {
    gasLimit: gas,
  });

  return tx;
};

export const removeLiquidityETH = async (
  address: string,
  liquidity: string,
  amountTokenMin: string,
  amountETHMin: string,
  userAccount: string,
  deadline: number,
  swapContract: Contract,
  decimals?: number
) => {
  const params = [
    address,
    parseEther(liquidity),
    parseUnits(amountTokenMin, decimals),
    parseEther(amountETHMin),
    userAccount,
    deadline,
  ];

  const gas = await swapContract.removeLiquidityETH.estimateGas(...params);

  const tx = await swapContract.removeLiquidityETH(...params, {
    gasLimit: gas,
  });

  return tx;
};
