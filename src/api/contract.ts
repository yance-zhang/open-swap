import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers";
import { getEthereum } from "../utils/ethereum";
import swapRouterAbi from "./abi/swapRouter.json";
import tokenPairAbi from "./abi/tokenPair.json";
import ERC20Abi from "./abi/ERC20.json";
import { Decimal } from "../utils/decimal";

export const swapContractAddress = `0xF70EA4F16F80a20DE3b281CC9D310Ef158d9B961`;
export const tokenPairAddress = `0xBb1FFa4CC1C0063C47b864deD62028b0079552d6`;

export const GAS_LIMIT = 3000000;

export const testnetConfig = {
  chainId: "0x1",
  chainName: "Frame Testnet",
  rpcUrls: ["https://rpc.testnet.frame.xyz/http"],

  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://explorer.testnet.frame.xyz"],
};

const EthereumProvider = getEthereum();

export const checkApprove = async (
  tokenAddress: string,
  owner: string,
  spender: string,
  amount: Decimal
) => {
  const tokenContract = await initTokenContract(tokenAddress);
  const res = await tokenContract.allowance(owner, spender);
  const allowance = Decimal.fromBigNumberString(res);

  if (amount.gt(allowance)) {
    if (allowance.gt(0)) {
      await tokenContract.approve(spender, "0x0", { gasLimit: GAS_LIMIT });
    }
    await tokenContract.approve(spender, amount.hex, {
      gasLimit: GAS_LIMIT,
    });
  }
};

export const checkNetwork = async () => {
  const chainId: string = await EthereumProvider.request({
    method: "eth_chainId",
  });

  if (chainId !== testnetConfig.chainId) {
    try {
      await EthereumProvider.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: testnetConfig.chainId,
          },
        ],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await EthereumProvider.request({
          method: "wallet_addEthereumChain",
          params: [testnetConfig],
        });
      }
    }
  }
};

const initTokenContract = async (contractAddress: string) => {
  const provider = new BrowserProvider(EthereumProvider);
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, ERC20Abi, signer);

  return contract;
};

const initContract = async (contractAddress: string, contractAbi: any) => {
  const provider = new BrowserProvider(EthereumProvider);
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, contractAbi, signer);

  return contract;
};

export const getBalanceByContractAddress = async (
  contractAddress: string,
  userAddress: string
) => {
  const tokenContract = await initContract(contractAddress, ERC20Abi);
  const sym = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  const balance = await tokenContract.balanceOf(userAddress);
  const readableBalance = formatUnits(balance, decimals);

  return readableBalance;
};

export const swapContract = await initContract(
  swapContractAddress,
  swapRouterAbi
);

export const getReverses = async (pairAddress: string) => {
  const pairContract = await initContract(pairAddress, tokenPairAbi);
  const reverses = await pairContract.getReserves();

  return reverses;
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
  deadline: number
) => {
  const params = [
    parseUnits(amountIn),
    parseUnits(amountOutMin),
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
