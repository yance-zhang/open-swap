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

export const getTokenListApi = () => {
  return axios.get<TApiResponse<SwapTokenInfo[]>>(`/frame/token_list`);
};

export type SwapPairInfo = {
  pair: string;
  reserve0: number;
  reserve1: number;
  token0: string;
  token1: string;
};

export const getSwapPairListApi = async () => {
  return axios.get<TApiResponse<SwapPairInfo[]>>("/frame/swap/pair_list");
};

export const getETHPriceApi = async () => {
  return axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
  );
};
