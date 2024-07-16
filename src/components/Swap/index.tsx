import ChartIcon from "../../assets/chart.svg";
import ChartIconDark from "../../assets/chart_dark.svg";
import {
  SwapPairInfo,
  SwapTokenInfo,
  getSwapPairListApi,
  getTokenListApi,
} from "../../api";
import clsx from "clsx";
import { FC, useContext, useEffect, useState } from "react";
import AddLiquidity from "./addLiquidity";
import Swap from "./swap";
import React from "react";
import { ThemeContext } from "@emotion/react";

const Dex: FC<{ openChart: () => void }> = ({ openChart }) => {
  const [activeTab, setActiveTab] = useState<string>("swap");
  const [tokenList, setTokenList] = useState<SwapTokenInfo[]>([]);
  const [pairList, setPairList] = useState<SwapPairInfo[]>([]);
  const theme: any = useContext(ThemeContext);
  const isLight = theme === "light";

  useEffect(() => {
    const fetchTokensAndPairs = async () => {
      try {
        const tokens = await getTokenListApi();
        const pairs = await getSwapPairListApi();

        setTokenList(tokens.data);
        setPairList(pairs.data);
      } catch (error) {
        console.log(error);
      }
    };
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
              <Swap tokenList={tokenList} pairList={pairList} />
            ) : (
              <AddLiquidity tokenList={tokenList} pairList={pairList} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dex;
