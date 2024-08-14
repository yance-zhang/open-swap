import { ThemeContext } from "@emotion/react";
import { Close } from "@mui/icons-material";
import clsx from "clsx";
import { formatUnits } from "ethers";
import { SnackbarKey } from "notistack";
import React, { FC, useContext, useEffect, useState } from "react";
import {
  SwapPairInfo,
  SwapTokenInfo,
  getSwapPairListApi,
  getTokenListApi,
  getTokenPriceApi,
} from "../../api";
import ChartIcon from "../../assets/chart.svg";
import ChartIconDark from "../../assets/chart_dark.svg";
import AddLiquidity from "./addLiquidity";
import LPTokens from "./LPTokens";
import Swap from "./swap";

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

const Dex: FC<{ openChart: () => void }> = ({ openChart }) => {
  const [activeTab, setActiveTab] = useState<string>("swap");
  const [tokenList, setTokenList] = useState<SwapTokenInfo[]>([]);
  const [pairList, setPairList] = useState<SwapPairInfo[]>([]);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [tokenPriceMap, setTokenPriceMap] = useState<any>({
    USDT: 0,
    USDC: 0,
  });
  const theme: any = useContext(ThemeContext);
  const isLight = theme === "light";

  const getTokens = async () => {
    try {
      const tokens = await getTokenListApi();
      setTokenList(
        tokens.data
          .filter((t) => !t.name.toLowerCase().includes("puf"))
          .map((t) => ({ ...t, address: t.address.toLowerCase() }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getPairs = async () => {
    try {
      const pairs = await getSwapPairListApi();

      setPairList(
        pairs.data.map((p) => ({
          ...p,
          token0: p.token0.toLowerCase(),
          token1: p.token1.toLowerCase(),
          pair: p.pair.toLowerCase(),
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenPrice = async () => {
    try {
      const res = await getTokenPriceApi({
        ids: "ethereum,tether,usd-coin",
        vs_currencies: "usd",
      });
      if (res.ethereum) {
        setEthPrice(res.ethereum.usd);
        setTokenPriceMap({
          USDT: res.tether.usd,
          USDC: res["usd-coin"].usd,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTokensAndPairs = async () => {
    getTokens();
    getPairs();
    getTokenPrice();
  };

  const calcPrice = (amountA: string, amountB: string, priceB: number) => {
    return (Number(amountB) * priceB) / Number(amountA);
  };

  const updateTokenPriceByPair = () => {
    let tokens = tokenList.map((t) => {
      if (tokenPriceMap[t.symbol]) {
        return { ...t, price: tokenPriceMap[t.symbol] };
      }
      return t;
    });
    const usdt = tokens.find((t) => t.symbol === "USDT");
    const usdc = tokens.find((t) => t.symbol === "USDC");

    pairList.forEach((pair) => {
      if (pair.token0 === usdt?.address) {
        tokens = tokens.map((t) => {
          if (t.address === pair.token1) {
            return {
              ...t,
              price: calcPrice(
                formatUnits(pair.reserve1, t.decimals),
                formatUnits(pair.reserve0, usdt.decimals),
                usdt.price
              ),
            };
          }
          return t;
        });
      }
      if (pair.token1 === usdt?.address) {
        tokens = tokens.map((t) => {
          if (t.address === pair.token0) {
            return {
              ...t,
              price: calcPrice(
                formatUnits(pair.reserve0, t.decimals),
                formatUnits(pair.reserve1, usdt.decimals),
                usdt.price
              ),
            };
          }
          return t;
        });
      }
      if (pair.token0 === usdc?.address) {
        tokens = tokens.map((t) => {
          if (t.address === pair.token1) {
            return {
              ...t,
              price: calcPrice(
                formatUnits(pair.reserve1, t.decimals),
                formatUnits(pair.reserve0, usdc.decimals),
                usdc.price
              ),
            };
          }
          return t;
        });
      }
      if (pair.token1 === usdc?.address) {
        tokens = tokens.map((t) => {
          if (t.address === pair.token0) {
            return {
              ...t,
              price: calcPrice(
                formatUnits(pair.reserve0, t.decimals),
                formatUnits(pair.reserve1, usdc.decimals),
                usdc.price
              ),
            };
          }
          return t;
        });
      }
    });

    setTokenList(tokens);
  };

  useEffect(() => {
    if (tokenPriceMap.USDT && tokenList.length) {
      updateTokenPriceByPair();
    }
  }, [tokenList.length, tokenPriceMap.USDT]);

  useEffect(() => {
    fetchTokensAndPairs();
  }, []);

  return (
    <div className="flex flex-1 justify-center ">
      <div className="flex flex-col pb-5 max-w-[1280px]">
        <div className="flex self-center flex-col w-[calc(100vw-32px)] lg:w-[500px] min-h-[475px] p-5 mb-10 bg-white/70 dark:bg-[#222328CC] rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  activeTab === "swap"
                    ? "bg-black text-white dark:bg-white dark:text-[#2B2D34]"
                    : "bg-white dark:bg-[#2B2D34] dark:text-white/50",
                  " cursor-pointer border-black rounded-full text-center leading-[22px] px-4 py-3 font-[MonumentExtended] text-base "
                )}
                onClick={() => setActiveTab("swap")}
              >
                Swap
              </span>
              <span
                className={clsx(
                  activeTab === "liquidity"
                    ? "bg-black text-white dark:bg-white dark:text-[#2B2D34]"
                    : "bg-white dark:bg-[#2B2D34] dark:text-white/50",
                  " cursor-pointer border-black rounded-full text-center leading-[22px] px-4 py-3 font-[MonumentExtended] text-base"
                )}
                onClick={() => setActiveTab("liquidity")}
              >
                Add liquidity
              </span>
            </div>
            <div className="flex">
              <img
                onClick={openChart}
                src={isLight ? ChartIcon : ChartIconDark}
                alt=""
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="flex-1 py-[30px]">
            {activeTab === "swap" ? (
              <Swap
                tokenList={tokenList}
                pairList={pairList}
                ethPrice={ethPrice}
                tokenPriceMap={tokenPriceMap}
              />
            ) : (
              <AddLiquidity
                tokenList={tokenList}
                pairList={pairList}
                updateTokensAndPairs={fetchTokensAndPairs}
              />
            )}
          </div>
          {activeTab === "liquidity" && (
            <LPTokens tokenList={tokenList} pairList={pairList} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dex;
