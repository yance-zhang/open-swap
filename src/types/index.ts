export type SwapTokenInfo = {
  address: string;
  decimals: number;
  icon: string;
  name: string;
  price: number;
  symbol: string;
};

export type TApiResponse<T> = {
  data: T;
  errmsg: string;
  errno: number;
};
