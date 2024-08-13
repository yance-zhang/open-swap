import axios from "axios";
import { TApiResponse } from "../types";

// API Docs: https://testnet-api.burst.wtf/frame/docs/swagger/index.html

declare module "axios" {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

export const BaseUrl = import.meta.env.VITE_API_URL;

axios.interceptors.request.use(
  function (config) {
    config.baseURL = BaseUrl;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    return response ? response.data : response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export type SwapTokenInfo = {
  address: string;
  decimals: number;
  icon: string;
  name: string;
  price: number;
  symbol: string;
};

export type LPTokenInfo = SwapPairInfo & {
  balance: string;
  supply: string;
  token0Info?: SwapTokenInfo;
  token1Info?: SwapTokenInfo;
};

export const getTokenListApi = () => {
  return axios.get<TApiResponse<SwapTokenInfo[]>>(`/swap/token_list`, {
    params: { network: "eth_sepolia" },
  });
};

export type SwapPairInfo = {
  pair: string;
  reserve0: number;
  reserve1: number;
  token0: string;
  token1: string;
};

export const getSwapPairListApi = async () => {
  return axios.get<TApiResponse<SwapPairInfo[]>>("/swap/pair_list", {
    params: { network: "eth_sepolia" },
  });
};

export const getETHPriceApi = async () => {
  return axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
  );
};
export const getTokenPriceApi = async (params: {
  ids: string;
  vs_currencies: string;
}) => {
  return axios.get(`https://api.coingecko.com/api/v3/simple/price`, { params });
};
