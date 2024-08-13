import { useConnectWallet } from "@web3-onboard/react";
import dayjs from "dayjs";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import { useSnackbar } from "notistack";
import React, { FC, useEffect, useState } from "react";
import { RenderSnackbarAction } from ".";
import { useDispatch, useSelector, userAddress } from "../../../lib/redux";
import { SwapPairInfo, SwapTokenInfo } from "../../api";
import { checkApprove } from "../../contract";
import {
  SWAP_ROUTER_ADDRESS,
  addLiquidity,
  addLiquidityETH,
  getETHBalance,
  initPairContract,
  initSwapContracts,
  initTokenContract,
} from "../../contract/swap";
import {
  DEFAULT_CALCULATE_PRECISION,
  formatBalanceNumber,
  formatNumber,
  isSameAddress,
  prettifyNumber,
} from "../../utils";
import { checkNetwork, getEthereum } from "../../utils/ethereum";
import {
  DEFAULT_MINUTES,
  ETH_ADDRESS,
  SlippageController,
  SwapTokenInput,
  defaultSlippagePercent,
  defaultTokenDTO,
  filterTokenByPair,
  findPairByTokens,
} from "./swap";

const AddLiquidity: FC<{
  tokenList: SwapTokenInfo[];
  pairList: SwapPairInfo[];
  updateTokensAndPairs: () => void;
}> = ({ tokenList, pairList, updateTokensAndPairs }) => {
  const dispatch = useDispatch();
  const [{ wallet }, connect] = useConnectWallet();
  const userAccount = useSelector(userAddress);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [swapContract, setSwapContract] = useState<Contract>();
  const [pairAddress, setPairAddress] = useState<string>("");
  const [tokenA, setTokenA] = useState<SwapTokenInfo>(defaultTokenDTO);
  const [tokenB, setTokenB] = useState<SwapTokenInfo>(defaultTokenDTO);
  const [amountA, setAmountA] = useState<string>("0");
  const [amountB, setAmountB] = useState<string>("0");
  const [updateTime, setUpdateTime] = useState<number>(0);
  const [slippage, setSlippage] = useState<string>(defaultSlippagePercent);
  const [deadline, setDeadline] = useState<number>(DEFAULT_MINUTES);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);
  const [allowanceA, setAllowanceA] = useState<bigint>(0n);
  const [allowanceB, setAllowanceB] = useState<bigint>(0n);
  const [balanceAExceed, setBalanceAExceed] = useState<boolean>(false);
  const [balanceBExceed, setBalanceBExceed] = useState<boolean>(false);
  const [WETHAddress, setWETHAddress] = useState<string>("");
  const [tokenAmounts, setTokenAmounts] = useState<{
    tokenA: number;
    tokenB: number;
  }>({ tokenA: 0, tokenB: 0 });

  const init = async () => {
    await checkNetwork();
    const contracts = await initSwapContracts();
    setSwapContract(contracts?.swapContract);

    if (contracts?.swapContract) {
      const weth = await contracts.swapContract.WETH();
      setWETHAddress(weth);
    }
  };

  const fetchAllowance = async () => {
    const tokenAContract = await initTokenContract(tokenA.address);
    const tokenBContract = await initTokenContract(tokenB.address);

    const allowanceForA = isSameAddress(tokenA.address, ETH_ADDRESS)
      ? await getETHBalance(userAccount)
      : await tokenAContract.allowance(userAccount, SWAP_ROUTER_ADDRESS);
    const allowanceForB = isSameAddress(tokenB.address, ETH_ADDRESS)
      ? await getETHBalance(userAccount)
      : await tokenBContract.allowance(userAccount, SWAP_ROUTER_ADDRESS);

    setAllowanceA(allowanceForA);
    setAllowanceB(allowanceForB);
  };

  const getBaseExchangeRate = async () => {
    if (!pairAddress) {
      return;
    }

    await checkNetwork();
    try {
      const pairContract = await initPairContract(pairAddress);
      const reserves = (await pairContract.getReserves()).toObject();
      const token0 = await pairContract.token0();
      const { _reserve0, _reserve1 } = reserves;
      let amounts = {
        tokenA: 0,
        tokenB: 0,
      };

      if (isSameAddress(tokenA.address, token0)) {
        amounts = {
          tokenA: Number(formatUnits(_reserve0, tokenA.decimals)),
          tokenB: Number(formatUnits(_reserve1, tokenB.decimals)),
        };
      } else {
        amounts = {
          tokenA: Number(formatUnits(_reserve1, tokenA.decimals)),
          tokenB: Number(formatUnits(_reserve0, tokenB.decimals)),
        };
      }
      setTokenAmounts(amounts);
      setExchangeRate(amounts.tokenB / amounts.tokenA);
    } catch (error) {
      console.log(error);
    }
  };

  const approveTokens = async () => {
    await checkNetwork();
    const key = "approveTokens";

    enqueueSnackbar({
      message: "Pending approval...",
      variant: "info",
      key,
      action: (key) => (
        <RenderSnackbarAction snackbarKey={key} closeSnackbar={closeSnackbar} />
      ),
    });
    setDisabledBtn(true);
    try {
      const provider = getEthereum();
      const ethersProvider = new BrowserProvider(provider);
      const nonce = await ethersProvider.getTransactionCount(userAccount);
      const tokenAContract = await initTokenContract(tokenA.address);
      const tokenBContract = await initTokenContract(tokenB.address);
      const approveA = allowanceA < parseUnits(amountA || "0", tokenA.decimals);
      if (approveA) {
        const allowance = await checkApprove(
          tokenAContract,
          userAccount,
          SWAP_ROUTER_ADDRESS,
          amountA,
          nonce,
          tokenA.decimals
        );
        setAllowanceA(allowance || 0n);
      }
      if (allowanceB < parseUnits(amountB || "0", tokenB.decimals)) {
        const nonceNew = await ethersProvider.getTransactionCount(userAccount);
        const allowance = await checkApprove(
          tokenBContract,
          userAccount,
          SWAP_ROUTER_ADDRESS,
          amountB,
          nonceNew,
          tokenB.decimals
        );
        setAllowanceB(allowance || 0n);
      }
    } catch (error) {}
    closeSnackbar(key);
    setDisabledBtn(false);
  };

  const handleAddLiquidity = async () => {
    if (!swapContract || Number(amountA) <= 0 || Number(amountB) <= 0) {
      return;
    }

    await checkNetwork();
    const key = "addLiquidity";
    setDisabledBtn(true);
    enqueueSnackbar({
      message: "Pending transaction...",
      variant: "info",
      key,
      action: (key) => (
        <RenderSnackbarAction snackbarKey={key} closeSnackbar={closeSnackbar} />
      ),
    });

    try {
      const ddl = dayjs().add(deadline, "minute").unix();
      const provider = getEthereum();
      const ethersProvider = new BrowserProvider(provider);
      const nonce = await ethersProvider.getTransactionCount(userAccount);

      if (
        isSameAddress(tokenA.address, ETH_ADDRESS) ||
        isSameAddress(tokenB.address, ETH_ADDRESS)
      ) {
        const tokenAIsETH = isSameAddress(tokenA.address, ETH_ADDRESS);

        const tx = await addLiquidityETH(
          tokenAIsETH ? tokenB.address : tokenA.address,
          tokenAIsETH ? amountA : amountB,
          tokenAIsETH ? amountB : amountA,

          (
            Number(tokenAIsETH ? amountA : amountB) *
            (1 - Number(slippage) / 100)
          ).toFixed(DEFAULT_CALCULATE_PRECISION),
          (
            Number(tokenAIsETH ? amountB : amountA) *
            (1 - Number(slippage) / 100)
          ).toFixed(DEFAULT_CALCULATE_PRECISION),
          userAccount,
          ddl,
          swapContract,
          tokenAIsETH ? tokenB.decimals : tokenA.decimals,
          nonce
        );
        await tx.wait();
      } else {
        const tx = await addLiquidity(
          tokenA.address,
          tokenB.address,
          amountA,
          amountB,
          (Number(amountA) * (1 - Number(slippage) / 100)).toFixed(
            DEFAULT_CALCULATE_PRECISION
          ),
          (Number(amountB) * (1 - Number(slippage) / 100)).toFixed(
            DEFAULT_CALCULATE_PRECISION
          ),
          userAccount,
          ddl,
          swapContract,
          tokenA.decimals,
          tokenB.decimals,
          nonce
        );
        await tx.wait();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar({
        variant: "warning",
        autoHideDuration: 5000,
        message: "Transaction Failed.",
        key: "failed",
        action: (key) => (
          <RenderSnackbarAction
            snackbarKey={key}
            closeSnackbar={closeSnackbar}
          />
        ),
      });
    }

    closeSnackbar(key);
    setDisabledBtn(false);
    setAmountA("0");
    setAmountB("0");
    setUpdateTime(dayjs().unix());
    getBaseExchangeRate();
    fetchAllowance();
    updateTokensAndPairs();
  };

  const updateAmountB = (value: string) => {
    if (!pairAddress) {
      return;
    }
    const amount = Number(value) * exchangeRate;

    setAmountB(amount > 0 ? prettifyNumber(amount).toString() : "0");
  };

  const updateAmountA = (value: string) => {
    if (!pairAddress) {
      return;
    }
    const amount = Number(value) / exchangeRate;

    setAmountA(amount > 0 ? prettifyNumber(amount).toString() : "0");
  };

  useEffect(() => {
    if (!userAccount || !tokenA.address || !tokenB.address) {
      return;
    }
    fetchAllowance();
  }, [tokenA.address, tokenB.address, userAccount]);

  useEffect(() => {
    if (tokenList.length === 0) {
      return;
    }
    setTokenA(tokenList[0]);
    setTokenB(tokenList[1]);

    const filtered = filterTokenByPair(
      tokenList[0].address,
      pairList,
      WETHAddress,
      tokenList
    );
    setTokenB(filtered[0] || tokenList[1]);
  }, [tokenList]);

  useEffect(() => {
    const newPair = findPairByTokens(
      isSameAddress(tokenA.address, ETH_ADDRESS) ? WETHAddress : tokenA.address,
      isSameAddress(tokenB.address, ETH_ADDRESS) ? WETHAddress : tokenB.address,
      pairList
    );
    setPairAddress(newPair?.pair || "");
    setExchangeRate(0);
    setAmountA("0");
    setAmountB("0");
  }, [tokenA, tokenB, pairList]);

  useEffect(() => {
    if (pairAddress) {
      getBaseExchangeRate();
    }
  }, [pairAddress]);

  useEffect(() => {
    init();
  }, []);

  const needApproveA =
    allowanceA < parseUnits((Number(amountA) || 0).toString(), tokenA.decimals);

  const needApproveB =
    allowanceB < parseUnits((Number(amountB) || 0).toString(), tokenB.decimals);

  const needApprove = needApproveA || needApproveB;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative flex flex-col gap-4">
        <SwapTokenInput
          label=""
          value={amountA}
          token={tokenA}
          onValueChange={(value, exceed) => {
            setAmountA(value);
            updateAmountB(value);
            setBalanceAExceed(!!exceed);
          }}
          onTokenChange={(token) => setTokenA(token)}
          updateTime={updateTime}
          tokenList={tokenList}
        />
        <SwapTokenInput
          label=""
          value={amountB}
          token={tokenB}
          onValueChange={(value, exceed) => {
            setAmountB(value);
            updateAmountA(value);
            setBalanceBExceed(!!exceed);
          }}
          onTokenChange={(token) => setTokenB(token)}
          updateTime={updateTime}
          tokenList={tokenList}
        />
      </div>
      {pairAddress ? (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[#3D3F48] dark:text-white/80 font-medium">
            Pool Info
          </span>
          <div className="flex flex-wrap gap-y-4 px-4 py-4 text-black dark:text-white border border-black dark:border-white/30 rounded-2xl">
            <div className="flex flex-col w-1/3 items-center gap-0.5">
              <span className="font-medium">
                {formatBalanceNumber(exchangeRate)}
              </span>
              <span className="text-sm text-[#838594]">
                {tokenB.symbol} per {tokenA.symbol}
              </span>
            </div>
            <div className="flex flex-col w-1/3 items-center gap-0.5">
              <span className="font-medium">
                {formatBalanceNumber(1 / exchangeRate)}
              </span>
              <span className="text-sm text-[#838594]">
                {tokenA.symbol} per {tokenB.symbol}
              </span>
            </div>
            <div className="flex flex-col w-1/3 items-center gap-0.5">
              <span className="font-medium">
                {prettifyNumber(
                  (Number(amountA) / (tokenAmounts.tokenA + Number(amountA))) *
                    100
                )}
                %
              </span>
              <span className="text-sm text-[#838594]">Share of pool</span>
            </div>

            <div className="flex flex-col w-1/3 items-center gap-0.5">
              <span className="font-medium">
                {formatNumber(tokenAmounts.tokenA)}
              </span>
              <span className="text-sm text-[#838594]">
                {tokenA.symbol} in pool
              </span>
            </div>
            <div className="flex flex-col w-1/3 items-center gap-0.5">
              <span className="font-medium">
                {formatNumber(tokenAmounts.tokenB)}
              </span>
              <span className="text-sm text-[#838594]">
                {tokenB.symbol} in pool
              </span>
            </div>
            <div className="flex flex-col w-1/3 items-center gap-0.5">
              <span className="font-medium">
                ${formatNumber(tokenAmounts.tokenA * tokenA.price * 2)}
              </span>
              <span className="text-sm text-[#838594]">FDV</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex text-[#F9441F]">
          No pool for swap, you can add liquidity to create a new pool
        </div>
      )}
      <SlippageController
        slippage={slippage}
        onSlippageChange={(slippage) => setSlippage(slippage)}
        deadline={deadline}
        onDeadlineChange={(deadline) => setDeadline(deadline)}
      />
      {!userAccount && (
        <button
          onClick={() => connect()}
          className="w-full h-14 rounded-[14px] border border-[#838594]  font-[Inter] font-medium tracking-wider text-white bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Wallet
        </button>
      )}
      {userAccount && (
        <button
          disabled={
            disabledBtn ||
            Number(amountA) <= 0 ||
            Number(amountB) <= 0 ||
            balanceAExceed ||
            balanceBExceed
          }
          onClick={needApprove ? approveTokens : handleAddLiquidity}
          className="w-full h-14 rounded-[14px] border border-[#838594] text-white  font-[Inter] font-medium tracking-wider bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {balanceAExceed || balanceBExceed
            ? "Balance Insufficient"
            : needApprove
            ? `Approve ${needApproveA ? tokenA.symbol : tokenB.symbol}`
            : "Add Liquidity"}
        </button>
      )}
    </div>
  );
};

export default AddLiquidity;
