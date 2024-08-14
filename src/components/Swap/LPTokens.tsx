import { Balance, Close } from "@mui/icons-material";
import { Input, Modal } from "@mui/material";
import dayjs from "dayjs";
import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
  parseUnits,
} from "ethers";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";
import { RenderSnackbarAction } from ".";
import { useSelector, userAddress } from "../../../lib/redux";
import { LPTokenInfo, SwapPairInfo, SwapTokenInfo } from "../../api";
import { checkApprove } from "../../contract";
import {
  SWAP_ROUTER_ADDRESS,
  initPairContract,
  initSwapContracts,
  initTokenContract,
  removeLiquidity,
  removeLiquidityETH,
} from "../../contract/swap";
import { formatBalanceNumber, isSameAddress } from "../../utils";
import { checkNetwork, getEthereum } from "../../utils/ethereum";
import {
  DEFAULT_MINUTES,
  ETH_ADDRESS,
  SlippageController,
  defaultSlippagePercent,
} from "./swap";
import ThemeContext from "../../ThemeContext";

export const ManageLPToken: FC<{
  currentLP: LPTokenInfo;
  open: boolean;
  close: () => void;
}> = ({ currentLP, open, close }) => {
  const userAccount = useSelector(userAddress);
  const [WETHAddress, setWETHAddress] = useState<string>("");
  const [swapContract, setSwapContract] = useState<Contract>();
  const [slippage, setSlippage] = useState<string>(defaultSlippagePercent);
  const [lpAmount, setLpAmount] = useState<string>("0");
  const [deadline, setDeadline] = useState<number>(DEFAULT_MINUTES);
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n);
  const theme = useContext(ThemeContext);
  const isLight = theme === "light";

  const init = async () => {
    await checkNetwork();
    const contracts = await initSwapContracts();
    setSwapContract(contracts?.swapContract);

    if (contracts?.swapContract) {
      const weth = await contracts.swapContract.WETH();
      setWETHAddress(weth);
    }
  };

  const approveLpToken = async () => {
    if (!currentLP) {
      return;
    }
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
      const contract = await initTokenContract(currentLP.pair);
      const decimals = await contract.decimals();
      const allowance = await checkApprove(
        contract,
        userAccount,
        SWAP_ROUTER_ADDRESS,
        lpAmount,
        nonce,
        decimals
      );
      setCurrentAllowance(allowance || 0n);
    } catch (error) {
      console.log(error);
    }
    closeSnackbar(key);
    setDisabledBtn(false);
  };

  const handleRemove = async () => {
    if (!currentLP || !swapContract || Number(lpAmount) <= 0) {
      return;
    }

    await checkNetwork();
    const { token0, token1, token0Info, token1Info } = currentLP;
    const ddl = dayjs().add(deadline, "minute").unix();
    const key = "removeLiquidity";

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
      // remove ERC20 <=> ETH
      if (token0 === WETHAddress || token1 === WETHAddress) {
        const token0IsETH = token0 === WETHAddress;
        const tx = await removeLiquidityETH(
          token0IsETH ? token1 : token0,
          lpAmount,
          token0IsETH ? receiveToken.token1 : receiveToken.token0,
          token0IsETH ? receiveToken.token0 : receiveToken.token1,
          userAccount,
          ddl,
          swapContract,
          token0IsETH ? token1Info?.decimals : token0Info?.decimals
        );
        await tx.wait();
      }
      // remove ERC20 <=> ERC20
      else {
        const tx = await removeLiquidity(
          token0,
          token1,
          lpAmount,
          receiveToken.token0,
          receiveToken.token1,
          userAccount,
          ddl,
          swapContract,
          token0Info?.decimals,
          token1Info?.decimals
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
    close();
  };

  const receiveToken = useMemo(() => {
    if (!currentLP || !Number(lpAmount)) {
      return { token0: "0", token1: "0" };
    }
    const ratio = Number(lpAmount) / Number(currentLP.supply);
    const minimal = (100 - Number(slippage)) / 100;

    const token0 =
      ratio *
      Number(
        formatUnits(BigInt(currentLP.reserve0), currentLP.token0Info?.decimals)
      ) *
      minimal;
    const token1 =
      ratio *
      Number(
        formatUnits(BigInt(currentLP.reserve1), currentLP.token1Info?.decimals)
      ) *
      minimal;

    return {
      token0: token0.toFixed(currentLP.token0Info?.decimals || 6),
      token1: token1.toFixed(currentLP.token1Info?.decimals || 6),
    };
  }, [currentLP, lpAmount, slippage]);

  useEffect(() => {
    if (!currentLP) {
      return;
    }

    const updateAllowance = async () => {
      const contract = await initTokenContract(currentLP.pair);
      const allowance = await contract.allowance(
        userAccount,
        SWAP_ROUTER_ADDRESS
      );
      setCurrentAllowance(allowance);
    };

    updateAllowance();
  }, [currentLP, userAccount]);

  useEffect(() => {
    init();
  }, []);

  const needApproval = parseUnits(lpAmount || "0") > currentAllowance;

  return (
    <Modal open={open} onClose={close}>
      <div className="base-modal relative flex flex-col items-center w-[90vw] lg:w-[580px] p-5 lg:p-10 rounded-[10px] bg-white dark:bg-[#2b2d34] dark:text-white/70">
        <Close
          onClick={close}
          className="absolute right-4 top-4 cursor-pointer"
        />
        <div className="px-5 pb-5">
          <div className="py-5 text-center text-xl font-bold">
            <span className="">Remove Liquidity</span>
          </div>
          {currentLP && (
            <div className="flex flex-col">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={currentLP.token0Info?.icon}
                    alt=""
                  />
                  <img
                    className="w-8 h-8 rounded-full -ml-2"
                    src={currentLP.token1Info?.icon}
                    alt=""
                  />
                </div>
                <div className="w-[150px]">
                  <span className="">{currentLP.token0Info?.symbol}</span>-
                  <span className="">{currentLP.token1Info?.symbol}</span>
                </div>
                <Input
                  sx={{
                    fontSize: "28px",
                    lineHeight: "36px",
                    fontFamily: "Inter",
                    border: isLight
                      ? "1px solid #0000003B"
                      : "1px solid #FFFFFF3B",
                    borderRadius: "10px",
                    height: "40px",
                    padding: "0 12px",
                    width: "200px",
                    color: isLight ? "#000" : "#FFFFFF4D",
                  }}
                  className="rewards-claim-input lg:ml-[auto]"
                  type="number"
                  disableUnderline
                  onChange={(e: any) => {
                    const validStr = e.target.value.replace(
                      /[^0-9]{0,1}(\d*(?:\.\d{0,18})?).*$/g,
                      "$1"
                    );
                    setLpAmount(
                      Number(validStr) > Number(currentLP.balance)
                        ? currentLP.balance
                        : validStr
                    );
                  }}
                  onBlur={(e) => setLpAmount(`${Number(e.target.value)}`)}
                  value={lpAmount}
                  placeholder="0"
                  renderSuffix={() => (
                    <button
                      onClick={() => setLpAmount(currentLP.balance)}
                      className="pl-2 text-sm underline "
                    >
                      Max
                    </button>
                  )}
                />
              </div>
              <div className="flex flex-col py-5 my-5 border-y border-[#00000088] dark:border-white/30 gap-4">
                <span className="font-medium">You will receive:</span>
                <div className="flex items-center gap-1">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={currentLP.token0Info?.icon}
                    alt=""
                  />
                  <span className="">{currentLP.token0Info?.symbol}</span>
                  <span className="ml-[auto]">
                    {formatBalanceNumber(Number(receiveToken.token0))}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={currentLP.token1Info?.icon}
                    alt=""
                  />
                  <span className="">{currentLP.token1Info?.symbol}</span>
                  <span className="ml-[auto]">
                    {formatBalanceNumber(Number(receiveToken.token1))}
                  </span>
                </div>
              </div>
              <SlippageController
                slippage={slippage}
                onSlippageChange={(slippage) => setSlippage(slippage)}
                deadline={deadline}
                onDeadlineChange={(deadline) => setDeadline(deadline)}
              />
              <div className="flex items-center justify-around">
                <button
                  disabled={disabledBtn || !needApproval}
                  onClick={approveLpToken}
                  className="self-center w-40 py-2 px-4 mt-4 rounded-[12px] border border-[#838594] text-sm font-[Inter] font-medium tracking-wider bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve
                </button>
                <button
                  disabled={disabledBtn || needApproval}
                  onClick={handleRemove}
                  className="self-center w-40 py-2 px-4 mt-4 rounded-[12px] border border-[#838594] text-sm font-[Inter] font-medium tracking-wider bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-white/30  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const LPTokens: FC<{
  tokenList: SwapTokenInfo[];
  pairList: SwapPairInfo[];
}> = ({ tokenList, pairList }) => {
  const userAccount = useSelector(userAddress);
  const [LPTokens, setLPTokens] = useState<LPTokenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [WETHAddress, setWETHAddress] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [currentLP, setCurrentLP] = useState<LPTokenInfo>();

  const init = async () => {
    await checkNetwork();
    const contracts = await initSwapContracts();

    if (contracts?.swapContract) {
      const weth = await contracts.swapContract.WETH();
      setWETHAddress(weth);
    }
  };

  const getLPTokenBalanceAndSupplyByPair = async (pair: SwapPairInfo) => {
    try {
      const contract = await initPairContract(pair.pair);
      const balance: bigint = await contract.balanceOf(userAccount);
      const supply = await contract.totalSupply();
      const reserves = await contract.getReserves();
      const [reserve0, reserve1] = reserves;

      return {
        balance: formatEther(balance),
        supply: formatEther(supply),
        reserve0: reserve0.toString(),
        reserve1: reserve1.toString(),
      };
    } catch (error) {
      console.log(error);

      return {
        balance: "0",
        supply: "0",
      };
    }
  };

  const cancelRemoveLiquidity = () => {
    setOpen(false);
    setCurrentLP(undefined);
    getAllLPTokens();
  };

  const getAllLPTokens = async () => {
    setLoading(true);
    const list: LPTokenInfo[] = [];
    const tokenMap = new Map(
      tokenList.map((i) => [
        isSameAddress(i.address, ETH_ADDRESS) ? WETHAddress : i.address,
        i,
      ])
    );

    for (let i = 0; i < pairList.length; i++) {
      const pair = pairList[i];
      if (tokenMap.get(pair.token0) && tokenMap.get(pair.token1)) {
        const { balance, supply, reserve0, reserve1 } =
          await getLPTokenBalanceAndSupplyByPair(pair);
        if (Number(balance) > 0) {
          list.push({
            ...pair,
            balance,
            supply,
            reserve0,
            reserve1,
            token0Info: tokenMap.get(pair.token0),
            token1Info: tokenMap.get(pair.token1),
          });
        }
      }
    }
    setLoading(false);
    setLPTokens(list);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (
      pairList.length > 0 &&
      tokenList.length > 0 &&
      WETHAddress &&
      userAccount
    ) {
      getAllLPTokens();
    }
  }, [pairList, tokenList, WETHAddress, userAccount]);

  return (
    <div className="flex flex-col gap-6 mt-10 p-5 lg:w-full dark:text-white border border-black dark:border-white/30 dark:bg-transparent rounded-3xl">
      <div className="text-center font-[MonumentExtended] text-base lg:text-xl">
        LP Tokens
      </div>
      <div className="flex flex-col gap-4">
        {LPTokens.map((t) => (
          <div
            className="flex items-center flex-wrap justify-between gap-2"
            key={t.pair}
          >
            <div className="flex">
              <img
                className="w-8 h-8 rounded-full"
                src={t.token0Info?.icon}
                alt=""
              />
              <img
                className="w-8 h-8 rounded-full -ml-2"
                src={t.token1Info?.icon}
                alt=""
              />
            </div>
            <div className="w-[120px] text-sm">
              <span className="">{t.token0Info?.symbol}</span>-
              <span className="">{t.token1Info?.symbol}</span>
            </div>
            <div className="flex flex-col items-center mx-[auto]">
              <span className="text-sm text-gray-500">Balance</span>
              <span className="">{formatBalanceNumber(Number(t.balance))}</span>
            </div>
            <button
              onClick={() => {
                setCurrentLP(t);
                setOpen(true);
              }}
              className="py-1 px-4 mx-auto rounded-[6px] border border-[#838594]  font-[Inter] font-medium text-white tracking-wider bg-[#000] dark:bg-[#FF9900] dark:text-[#2B2D34] dark:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Manage
            </button>
          </div>
        ))}
        {LPTokens.length === 0 && (
          <div className="my-5 text-gray-400 text-center">
            {loading ? "Loading..." : "Not Found"}
          </div>
        )}
      </div>

      {currentLP && (
        <ManageLPToken
          currentLP={currentLP}
          open={open}
          close={cancelRemoveLiquidity}
        />
      )}
    </div>
  );
};

export default LPTokens;
