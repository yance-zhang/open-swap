import { SwapPairInfo, SwapTokenInfo } from "../../api";
import { checkApprove } from "../../contract";
import {
  SWAP_ROUTER_ADDRESS,
  addLiquidity,
  getExchangeRateByPair,
  initSwapContracts,
  initTokenContract,
} from "../../contract/swap";
import { useDispatch, useSelector, userAddress } from "../../../lib/redux";
import { formatBalanceNumber } from "../../utils";
import dayjs from "dayjs";
import { Contract, formatEther, formatUnits, parseUnits } from "ethers";
import { useSnackbar } from "notistack";
import { FC, useEffect, useState } from "react";
import {
  DEFAULT_MINUTES,
  DEFAULT_RATE_AMOUNT_IN,
  DEFAULT_RATE_AMOUNT_OUT_MULTIPLAYER,
  RenderSnackbarAction,
  SlippageController,
  SwapTokenInput,
  defaultSlippagePercent,
  defaultTokenDTO,
  findPairByTokens,
} from "./swap";
import React from "react";

const AddLiquidity: FC<{
  tokenList: SwapTokenInfo[];
  pairList: SwapPairInfo[];
}> = ({ tokenList, pairList }) => {
  const dispatch = useDispatch();
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
  const [exchangeRate, setExchangeRate] = useState<bigint>(0n);
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);
  const [allowanceA, setAllowanceA] = useState<bigint>(0n);
  const [allowanceB, setAllowanceB] = useState<bigint>(0n);
  const [balanceAExceed, setBalanceAExceed] = useState<boolean>(false);
  const [balanceBExceed, setBalanceBExceed] = useState<boolean>(false);

  const init = async () => {
    const contacts = await initSwapContracts();
    setSwapContract(contacts?.swapContract);
  };

  const fetchAllowance = async () => {
    const tokenAContract = await initTokenContract(tokenA.address);
    const tokenBContract = await initTokenContract(tokenB.address);

    const allowanceForA = await tokenAContract.allowance(
      userAccount,
      SWAP_ROUTER_ADDRESS
    );
    const allowanceForB = await tokenBContract.allowance(
      userAccount,
      SWAP_ROUTER_ADDRESS
    );
    setAllowanceA(allowanceForA);
    setAllowanceB(allowanceForB);
  };

  const getBaseExchangeRate = async () => {
    if (!swapContract || !tokenA.address || !tokenB.address) {
      return;
    }

    try {
      const val = await getExchangeRateByPair(
        DEFAULT_RATE_AMOUNT_IN,
        swapContract,
        [tokenA.address, tokenB.address],
        tokenA.decimals
      );
      setExchangeRate(val * DEFAULT_RATE_AMOUNT_OUT_MULTIPLAYER);
    } catch (error) {
      console.log(error);
    }
  };

  const approveTokens = async () => {
    const key = "approveTokens";

    enqueueSnackbar({
      message: "Pending approval...",
      key,
      action: (key) => (
        <RenderSnackbarAction snackbarKey={key} closeSnackbar={closeSnackbar} />
      ),
    });
    setDisabledBtn(true);
    try {
      const tokenAContract = await initTokenContract(tokenA.address);
      const tokenBContract = await initTokenContract(tokenB.address);
      if (allowanceA < parseUnits(amountA || "0", tokenA.decimals)) {
        const allowance = await checkApprove(
          tokenAContract,
          userAccount,
          SWAP_ROUTER_ADDRESS,
          amountA,
          tokenA.decimals
        );
        setAllowanceA(allowance || 0n);
      }
      if (allowanceB < parseUnits(amountB || "0", tokenB.decimals)) {
        const allowance = await checkApprove(
          tokenBContract,
          userAccount,
          SWAP_ROUTER_ADDRESS,
          amountB,
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
    const key = "addLiquidity";
    setDisabledBtn(true);
    enqueueSnackbar({
      message: "Pending transaction...",
      key,
      action: (key) => (
        <RenderSnackbarAction snackbarKey={key} closeSnackbar={closeSnackbar} />
      ),
    });

    try {
      const ddl = dayjs().add(deadline, "minute").unix();
      const tx = await addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        (Number(amountA) * (1 - Number(slippage) / 100)).toString(),
        (Number(amountB) * (1 - Number(slippage) / 100)).toString(),
        userAccount,
        ddl,
        swapContract,
        tokenA.decimals,
        tokenB.decimals
      );
      await tx.wait();
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
  };

  const updateAmountB = (value: string) => {
    if (!pairAddress) {
      return;
    }
    const amount = Number(value) * Number(formatUnits(exchangeRate));

    setAmountB(amount > 0 ? amount.toFixed(3) : "0");
  };

  const updateAmountA = (value: string) => {
    if (!pairAddress) {
      return;
    }
    const amount = Number(value) / Number(formatEther(exchangeRate));

    setAmountA(amount > 0 ? amount.toFixed(3) : "0");
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
  }, [tokenList]);

  useEffect(() => {
    const newPair = findPairByTokens(tokenA.address, tokenB.address, pairList);
    setPairAddress(newPair?.pair || "");
    setExchangeRate(0n);

    if (newPair?.pair && swapContract) {
      getBaseExchangeRate();
    }
    setAmountA("0");
    setAmountB("0");
  }, [tokenA, tokenB, pairList, swapContract]);

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
        <div className="flex dark:text-white/70">
          1 {tokenA.name} ={" "}
          {formatBalanceNumber(Number(formatEther(exchangeRate)))} {tokenB.name}
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
          // onClick={() => dispatch(layoutSlice.actions.openConnectModal())}
          className="w-full h-14 rounded-[14px] border border-[#838594] uppercase font-[Inter] font-medium tracking-wider text-white bg-[#000] disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full h-14 rounded-[14px] border border-[#838594] uppercase font-[Inter] font-medium tracking-wider text-white bg-[#000] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {balanceAExceed || balanceBExceed
            ? "Balance Insufficient"
            : needApprove
            ? "Approve"
            : "Add Liquidity"}
        </button>
      )}
    </div>
  );
};

export default AddLiquidity;
