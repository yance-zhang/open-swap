import { SwapPairInfo, getETHPriceApi } from "../../api";

import { ArrowDownward, Close, ExpandMore, Info } from "@mui/icons-material";
import {
  Button,
  Input,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import clsx from "clsx";
import dayjs from "dayjs";
import { Contract, formatEther, formatUnits, parseUnits } from "ethers";
import { SnackbarKey, useSnackbar } from "notistack";
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector, userAddress } from "../../../lib/redux";
import { checkApprove } from "../../contract";
import {
  SWAP_ROUTER_ADDRESS,
  doSwap,
  getExchangeRateByPair,
  getFeeData,
  initPairContract,
  initSwapContracts,
  initTokenContract,
} from "../../contract/swap";
import { SwapTokenInfo } from "../../types";
import { formatBalanceNumber, formatNumber } from "../../utils";
import { useConnectWallet } from "@web3-onboard/react";
import ThemeContext from "../../ThemeContext";

export const DEFAULT_MINUTES = 5;
export const DEFAULT_RATE_AMOUNT_IN = "0.0001";
export const DEFAULT_RATE_AMOUNT_OUT_MULTIPLAYER = BigInt(
  1 / Number(DEFAULT_RATE_AMOUNT_IN)
);
export const DEBOUNCE_DELAY = 300;
export const DANGER_SWAP_THRESHOLD = -0.1;

export const findPairByTokens = (
  tokenA: string,
  tokenB: string,
  pairList: SwapPairInfo[]
) => {
  const targetPair = pairList.find((pair) => {
    if (pair.token0 === tokenA && pair.token1 === tokenB) {
      return pair;
    }
    if (pair.token1 === tokenA && pair.token0 === tokenB) {
      return pair;
    }
  });
  return targetPair;
};

export const RenderSnackbarAction: FC<{
  snackbarKey: SnackbarKey;
  closeSnackbar: (key: SnackbarKey) => void;
}> = ({ snackbarKey, closeSnackbar }) => {
  return (
    <div
      className="flex items-center justify-center w-[18px] h-[18px] overflow-hidden cursor-pointer"
      onClick={() => {
        closeSnackbar(snackbarKey);
      }}
    >
      <Close className="scale-75" />
    </div>
  );
};

export const SwapTokenInput: FC<{
  token: SwapTokenInfo;
  label: string;
  value: string;
  disabled?: boolean;
  onValueChange: (value: string, exceed?: boolean) => void;
  onTokenChange: (token: SwapTokenInfo) => void;
  updateTime: number;
  tokenList: SwapTokenInfo[];
  showPrice?: boolean;
  priceSlippage?: number;
}> = ({
  token,
  label,
  value,
  disabled,
  onValueChange,
  onTokenChange,
  updateTime,
  tokenList = [],
  showPrice,
  priceSlippage,
}) => {
  const userAccount = useSelector(userAddress);
  const [balance, setBalance] = useState<number>(0);
  const theme: any = useContext(ThemeContext);
  const isLight = theme === "light";

  const setMax = () =>
    onValueChange(balance.toString() || "0", Number(value) > balance);

  const handleSelect = (e: SelectChangeEvent) => {
    const target = tokenList.find((i) => i.address === e.target.value);
    target && onTokenChange(target);
  };

  useEffect(() => {
    if (!token.address || !userAccount) {
      return;
    }
    const fetchBalance = async () => {
      const tokenContract = await initTokenContract(token.address);
      const res = await tokenContract.balanceOf(userAccount);

      setBalance(Number(formatEther(res)));
    };
    fetchBalance();
  }, [token, updateTime, userAccount]);

  return (
    <div className="token-input flex flex-col gap-2 px-4 py-3 border border-[#4548511A] dark:bg-[#2B2D34] bg-white rounded-2xl">
      <div className="flex items-center justify-between">
        <Select
          variant="standard"
          sx={{ height: "40px" }}
          value={token.address}
          disableUnderline
          onChange={handleSelect}
          IconComponent={(props) => (
            <span
              className={clsx(props.className, "-mt-1")}
              style={{ color: isLight ? "#000" : "#ddd" }}
            >
              <ExpandMore />
            </span>
          )}
        >
          {tokenList.map((t) => (
            <MenuItem key={t.address} value={t.address}>
              <span className="flex items-center gap-1">
                <span className="inline-block min-w-8 h-8 rounded-full bg-slate-400">
                  {t.icon}
                </span>
                <span className=" font-medium text-base dark:text-white">
                  {t.name}
                </span>
              </span>
            </MenuItem>
          ))}
        </Select>

        <span
          className={clsx(
            "flex justify-between items-center gap-2 text-[#838594]"
          )}
        >
          Balance: {formatBalanceNumber(balance)}
          <span
            className=" inline-block w-14 text-center cursor-pointer font-bold text-xs"
            onClick={setMax}
          >
            Max
          </span>
        </span>
      </div>
      <div className="flex items-center justify-between">
        <Input
          sx={{
            fontSize: "36px",
            height: "42px",
            lineHeight: "42px",
            fontFamily: "Manrope",
            color: isLight ? "#000" : "#FFFFFF4D",
          }}
          disabled={disabled}
          type="number"
          disableUnderline
          onChange={(e: any) => {
            const validStr = e.target.value.replace(
              /[^0-9]{0,1}(\d*(?:\.\d{0,18})?).*$/g,
              "$1"
            );
            onValueChange(validStr, Number(value) > balance);
          }}
          onBlur={(e) => {
            onValueChange(`${Number(e.target.value)}`, Number(value) > balance);
          }}
          value={value}
        />
      </div>
      <div className="flex justify-between text-sm">
        {showPrice && (
          <span className="text-[#838594]">
            ${formatNumber(Number(value) * token.price)}
            {!!priceSlippage && (
              <span
                className={clsx(
                  "font-medium opacity-60",
                  priceSlippage < DANGER_SWAP_THRESHOLD && "text-[#F9441F]"
                )}
              >
                {" "}
                ({(priceSlippage * 100).toFixed(2)}%)
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export const defaultTokenDTO: SwapTokenInfo = {
  name: "",
  icon: "",
  address: "",
  decimals: 0,
  price: 0,
  symbol: "",
};

export const defaultSlippagePercent = "1";

export const SlippageController: FC<{
  slippage: string;
  onSlippageChange: (slippage: string) => void;
  deadline: number;
  onDeadlineChange: (deadline: number) => void;
}> = ({ slippage, onSlippageChange, deadline, onDeadlineChange }) => {
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const theme: any = useContext(ThemeContext);
  const isLight = theme === "light";

  return (
    <div className="">
      <div className="flex items-center justify-between h-14 text-base font-medium">
        <span className="flex items-center gap-1 text-[#3D3F48] dark:text-white/70">
          Max.Slippage <Info />
        </span>
        <span
          onClick={() => setShowSetting(!showSetting)}
          className="flex items-center gap-1 cursor-pointer dark:text-white"
        >
          {slippage}%{" "}
          <ExpandMore className={showSetting ? " rotate-180" : ""} />
        </span>
      </div>
      {showSetting && (
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <div className="flex items-stretch h-14 rounded-lg dark:text-white/70 bg-white dark:bg-[#2B2D34] border border-black dark:border-white/50 overflow-hidden">
              <button
                className={clsx(
                  "py-1.5 px-2.5 border-r border-black dark:border-white/50",
                  slippage === defaultSlippagePercent && "bg-[#FF8A02]/50"
                )}
              >
                Auto
              </button>
              <button
                className={clsx(
                  "py-1.5 px-2.5",
                  slippage !== defaultSlippagePercent && "bg-[#FF8A02]/50"
                )}
              >
                Custom
              </button>
            </div>
            <Input
              sx={{
                borderRadius: "8px",
                border: isLight ? "1px solid #000" : "1px solid #ddd",
                flex: "1",
                padding: "0 12px",
                color: isLight ? "#000" : "#fff",
              }}
              componentsProps={{
                input: {
                  style: {
                    textAlign: "right",
                    padding: "0 12px",
                    fontSize: "24px",
                  },
                },
              }}
              value={slippage}
              onChange={(e: any) => {
                const validStr = e.target.value.replace(
                  /[^0-9]{0,1}(\d*(?:\.\d{0,18})?).*$/g,
                  "$1"
                );
                onSlippageChange(validStr);
              }}
              onBlur={(e) => onSlippageChange(e.target.value)}
              disableUnderline
              renderSuffix={() => (
                <span className="text-black dark:text-white">%</span>
              )}
            />
          </div>
          {/* <div className="flex items-stretch h-14">
            <Input
              sx={{
                borderRadius: '8px',
                border: '1px solid #000',
                padding: '0 12px',
              }}
              fullWidth
              componentsProps={{
                input: {
                  style: { textAlign: 'right', padding: '0 12px' },
                },
              }}
              value={deadline}
              onChange={(e: any) => {
                const validStr = e.target.value.replace(
                  /[^0-9]{0,1}(\d*(?:\.\d{0,18})?).*$/g,
                  '$1',
                );
                onDeadlineChange(Number(validStr));
              }}
              onBlur={(e) => onDeadlineChange(Number(e.target.value))}
              disableUnderline
              renderSuffix={() => 'minutes'}
            />
          </div> */}
        </div>
      )}
    </div>
  );
};

const Swap: FC<{
  tokenList: SwapTokenInfo[];
  pairList: SwapPairInfo[];
}> = ({ tokenList = [], pairList = [] }) => {
  const dispatch = useDispatch();
  const [{ wallet }, connect] = useConnectWallet();
  const userAccount = useSelector(userAddress);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [swapContract, setSwapContract] = useState<Contract>();
  const [payToken, setPayToken] = useState<SwapTokenInfo>(defaultTokenDTO);
  const [receiveToken, setReceiveToken] =
    useState<SwapTokenInfo>(defaultTokenDTO);
  const [payAmount, setPayAmount] = useState<string>("0");
  const [receiveAmount, setReceiveAmount] = useState<string>("0");
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<bigint>(0n);
  const [pairAddress, setPairAddress] = useState<string>("");
  const [slippage, setSlippage] = useState<string>(defaultSlippagePercent);
  const [deadline, setDeadline] = useState<number>(DEFAULT_MINUTES);
  const [payAllowance, setPayAllowance] = useState<bigint>(0n);
  const [updateTime, setUpdateTime] = useState<number>(0);
  const [showSwapDetail, setShowSwapDetail] = useState<boolean>(false);
  const [gasCost, setGasCost] = useState<string>("0");
  const [balanceExceed, setBalanceExceed] = useState<boolean>(false);
  const [filteredTokenList, setFilteredTokenList] = useState<SwapTokenInfo[]>(
    []
  );
  const debounceTimer = useRef<any>();
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [currentPairLiquidity, setCurrentPairLiquidity] = useState<{
    pay: number;
    receive: number;
  }>({ pay: 0, receive: 0 });

  const init = async () => {
    const contracts = await initSwapContracts();
    setSwapContract(contracts?.swapContract);

    try {
      const feeData = await getFeeData();
      const gasPrice = feeData?.maxPriorityFeePerGas || 0n;
      const res = await getETHPriceApi();
      const ethPrice: number = res.ethereum.usd;
      const cost = Number(formatEther(gasPrice)) * 200000 * ethPrice;

      setGasCost(formatNumber(cost));
    } catch (error) {
      console.log(error);
    }
  };

  const updatePayAmount = async (value: string) => {
    setDisabledBtn(true);
    if (Number(value) <= 0 || !pairAddress || !swapContract) {
      setPayAmount("0");
      return;
    }

    const val = await getExchangeRateByPair(
      value,
      swapContract,
      [receiveToken.address, payToken.address],
      receiveToken.decimals
    );
    const pay = Number(formatUnits(val, payToken.decimals));
    setPayAmount(pay ? pay.toFixed(3) : "0");
    setExchangeRate(parseUnits((Number(value) / pay).toString()));
    setDisabledBtn(false);
  };

  const updatePayAmountDebounced = (value: string) => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      updatePayAmount(value);
    }, DEBOUNCE_DELAY);
  };

  const updateReceiveAmount = async (value: string) => {
    setDisabledBtn(true);

    if (Number(value) <= 0 || !pairAddress || !swapContract) {
      setReceiveAmount("0");
      return;
    }
    const val = await getExchangeRateByPair(
      value,
      swapContract,
      [payToken.address, receiveToken.address],
      payToken.decimals
    );
    const receive = Number(formatUnits(val, receiveToken.decimals));
    setReceiveAmount(receive ? receive.toFixed(3) : "0");
    setExchangeRate(parseUnits((receive / Number(value)).toString()));
    setDisabledBtn(false);
  };

  const updateReceiveAmountDebounced = (value: string) => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      updateReceiveAmount(value);
    }, DEBOUNCE_DELAY);
  };

  const getBaseExchangeRate = async () => {
    if (!swapContract || !payToken.address || !receiveToken.address) {
      return;
    }
    try {
      const val = await getExchangeRateByPair(
        DEFAULT_RATE_AMOUNT_IN,
        swapContract,
        [payToken.address, receiveToken.address],
        payToken.decimals
      );
      setExchangeRate(val * DEFAULT_RATE_AMOUNT_OUT_MULTIPLAYER);
    } catch (error) {
      console.log(error);
    }
  };

  const approvePayToken = async () => {
    setDisabledBtn(true);
    const payTokenContract = await initTokenContract(payToken.address);

    const key = "approveSwapRouter";
    enqueueSnackbar({
      message: "Pending approval...",
      key,
      action: (key) => (
        <RenderSnackbarAction snackbarKey={key} closeSnackbar={closeSnackbar} />
      ),
    });
    try {
      const allowance = await checkApprove(
        payTokenContract,
        userAccount,
        SWAP_ROUTER_ADDRESS,
        payAmount,
        payToken.decimals
      );
      setPayAllowance(allowance || 0n);
      setDisabledBtn(false);
      closeSnackbar(key);
    } catch (error) {
      setDisabledBtn(false);
      closeSnackbar(key);
    }
  };

  const fetchAllowance = async () => {
    const payTokenContract = await initTokenContract(payToken.address);

    const allowance = await payTokenContract.allowance(
      userAccount,
      SWAP_ROUTER_ADDRESS
    );
    setPayAllowance(allowance);
  };

  const getLiquidity = useCallback(
    async (pair: string) => {
      try {
        const pairContract = await initPairContract(pair);
        const reserves = (await pairContract.getReserves()).toObject();
        const token0 = await pairContract.token0();
        const { _reserve0, _reserve1 } = reserves;

        if (payToken.address === token0) {
          setCurrentPairLiquidity({
            pay: Number(formatUnits(_reserve0, payToken.decimals)),
            receive: Number(formatUnits(_reserve1, receiveToken.decimals)),
          });
        } else {
          setCurrentPairLiquidity({
            pay: Number(formatUnits(_reserve1, payToken.decimals)),
            receive: Number(formatUnits(_reserve0, receiveToken.decimals)),
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
    [payToken, receiveToken]
  );

  const checkSwap = async () => {
    if (dangerSwap) {
      setConfirmOpen(true);
      return;
    }
    handleSwap();
  };

  const handleSwap = async () => {
    if (!payAmount || !receiveAmount || !userAccount || !swapContract) {
      return;
    }

    setDisabledBtn(true);
    const key = "swap";
    enqueueSnackbar({
      message: "Pending transaction...",
      key,
      action: (key) => (
        <RenderSnackbarAction snackbarKey={key} closeSnackbar={closeSnackbar} />
      ),
    });

    const ddl = dayjs().add(deadline, "minute").unix();

    try {
      const tx = await doSwap(
        payAmount,
        (Number(receiveAmount) * (1 - Number(slippage) / 100)).toString(),
        [payToken.address, receiveToken.address],
        userAccount,
        ddl,
        swapContract,
        payToken.decimals
      );

      await tx.wait();

      setPayAmount("0");
      setReceiveAmount("0");
      setUpdateTime(dayjs().unix());
    } catch (error) {
      console.log(error);
      enqueueSnackbar({
        variant: "warning",
        autoHideDuration: 5000,
        message: "Approval Failed.",
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
    getBaseExchangeRate();
    fetchAllowance();
  };

  const switchTokens = () => {
    const temp = payToken;
    const filtered = filterTokenByPair(receiveToken.address);

    setPayToken(receiveToken);
    setFilteredTokenList(filtered.length ? filtered : tokenList);
    setReceiveToken(temp);
    getBaseExchangeRate();
  };

  const filterTokenByPair = (address: string) => {
    const matchedPair = pairList.filter(
      (pair) => pair.token0 === address || pair.token1 === address
    );

    const tokenAddresses: string[] = [];
    matchedPair.forEach((pair) => {
      !tokenAddresses.includes(pair.token0) && tokenAddresses.push(pair.token0);
      !tokenAddresses.includes(pair.token1) && tokenAddresses.push(pair.token1);
    });

    return tokenList.filter(
      (token) =>
        token.address !== address && tokenAddresses.includes(token.address)
    );
  };

  useEffect(() => {
    if (!userAccount || !payToken.address) {
      return;
    }

    fetchAllowance();
  }, [userAccount, payToken]);

  useEffect(() => {
    getBaseExchangeRate();
  }, [swapContract]);

  useEffect(() => {
    const newPair = findPairByTokens(
      payToken.address,
      receiveToken.address,
      pairList
    );
    setPairAddress(newPair?.pair || "");
    setExchangeRate(0n);
    setCurrentPairLiquidity({ pay: 0, receive: 0 });
    if (newPair?.pair) {
      getBaseExchangeRate();
      getLiquidity(newPair.pair);
    }
    setPayAmount("0");
    setReceiveAmount("0");
  }, [payToken, receiveToken, pairList]);

  useEffect(() => {
    if (tokenList.length === 0) {
      return;
    }
    setPayToken(tokenList[0]);
    const filtered = filterTokenByPair(tokenList[0].address);
    setReceiveToken(filtered[0] || tokenList[0]);
    setFilteredTokenList(filtered.length ? filtered : tokenList);
  }, [tokenList]);

  useEffect(() => {
    init();
  }, []);

  const needApprove =
    payAllowance <
    parseUnits((Number(payAmount) || 0).toString(), payToken.decimals);

  const priceSlippage = useMemo(() => {
    if (Number(payAmount) && Number(receiveAmount)) {
      const payUsd = payToken.price * Number(payAmount);
      const receiveUsd = receiveToken.price * Number(receiveAmount);

      return payUsd ? (receiveUsd - payUsd) / payUsd : 0;
    }
    return 0;
  }, [payAmount, payToken.price, receiveAmount, receiveToken.price]);

  const dangerSwap = priceSlippage < DANGER_SWAP_THRESHOLD;

  const lowLiquidity =
    Number(payAmount) > currentPairLiquidity.pay ||
    Number(receiveAmount) > currentPairLiquidity.receive;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative flex flex-col gap-4">
        <SwapTokenInput
          label="From"
          value={payAmount}
          token={payToken}
          onValueChange={(value, exceed) => {
            setPayAmount(value);
            setBalanceExceed(!!exceed);
            updateReceiveAmountDebounced(value);
          }}
          onTokenChange={(token) => {
            setPayToken(token);
            const filtered = filterTokenByPair(token.address);
            setFilteredTokenList(filtered.length ? filtered : tokenList);
            setReceiveToken(filtered[0] || tokenList[0]);
          }}
          updateTime={updateTime}
          tokenList={tokenList}
          showPrice
        />
        <SwapTokenInput
          label="To"
          value={receiveAmount}
          token={receiveToken}
          onValueChange={(value) => {
            setReceiveAmount(value);
            updatePayAmountDebounced(value);
          }}
          onTokenChange={(token) => setReceiveToken(token)}
          updateTime={updateTime}
          tokenList={filteredTokenList}
          priceSlippage={priceSlippage}
          showPrice
        />
        <span
          onClick={switchTokens}
          className="absolute left-1/2 top-1/2 translate-x-[-50%] dark:text-white/50 translate-y-[-50%] flex items-center justify-center w-[44px] h-[44px] rounded-full bg-white dark:bg-[#2B2D34] border-4 border-[#F9F6E8] dark:border-[#202229] cursor-pointer"
        >
          <ArrowDownward />
        </span>
      </div>
      {pairAddress ? (
        <div className="">
          <div
            className="flex items-center h-10 justify-between cursor-pointer dark:text-white/70"
            onClick={() => setShowSwapDetail(!showSwapDetail)}
          >
            <span className="">
              1 {payToken.name} ={" "}
              {formatBalanceNumber(Number(formatEther(exchangeRate)))}{" "}
              {receiveToken.name}
            </span>
            <ExpandMore className={showSwapDetail ? "rotate-180" : ""} />
          </div>
          {showSwapDetail && (
            <div className="flex flex-col gap-2 text-black dark:text-white">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className=" text-black/50 dark:text-white/50">
                  Max Slippage
                </span>
                <span className="">{slippage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span className=" text-black/50 dark:text-white/50">
                  Fee (1%)
                </span>
                <span className="">
                  ${formatNumber(payToken.price * Number(payAmount) * 0.01)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span className=" text-black/50 dark:text-white/50">
                  Network Fee
                </span>
                <span className="">${gasCost}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-10 items-center text-[#F9441F]">
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
      {userAccount && lowLiquidity && (
        <button
          disabled
          className="w-full h-14 rounded-[14px] border border-[#838594]  font-[Inter] text-white font-medium tracking-wider bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          No Enough Liquidity
        </button>
      )}
      {userAccount && !lowLiquidity && (
        <button
          disabled={
            disabledBtn ||
            Number(payAmount) <= 0 ||
            !pairAddress ||
            balanceExceed
          }
          onClick={needApprove ? approvePayToken : checkSwap}
          className="w-full h-14 rounded-[14px] border border-[#838594] text-white  font-[Inter] font-medium tracking-wider bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {balanceExceed
            ? "Balance Insufficient"
            : needApprove
            ? "Approve"
            : `Swap${dangerSwap ? " Anyway" : ""}`}
        </button>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="base-modal relative flex flex-col items-center w-[90vw] lg:w-[480px] p-5 lg:p-10 rounded-[10px] bg-white dark:bg-[#2b2d34] dark:text-white/70">
          <Close
            onClick={() => setConfirmOpen(false)}
            className="absolute right-4 top-4 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-5">
            <p className="text-xl font-bold">Warning</p>
            <p className="h-10 items-center text-base">
              The slippage is
              <span className="px-1 text-[#F9441F]">
                {(priceSlippage * 100).toFixed(2)}%
              </span>
              , do you want to continue?
            </p>

            <div className="flex items-center w-full gap-2 text-sm">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setPayAmount("0");
                  setReceiveAmount("0");
                }}
                className="w-1/2 h-10 rounded-[14px] border border-[#838594]  font-[Inter] bg-gray-50 dark:text-black/50 font-medium tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Swap
              </button>
              <button
                onClick={handleSwap}
                className="w-1/2 h-10 rounded-[14px] border border-[#838594]  font-[Inter] font-medium text-white tracking-wider bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Swap Anyway
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Swap;
