/* Core */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { TTokenDTO } from "../../../../src/types";

const initialState: ContractSliceState = {
  walletAddress: "",
  provider: null,
  supportTokens: [],
};

export const OPEN_SWAP_TOKEN = `OPEN_SWAP_TOKEN`;

export const contractSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setWalletAddress: (state, { payload }) => {
      localStorage.setItem(OPEN_SWAP_TOKEN, payload.address);
      state.walletAddress = payload.address;
    },
    updateProvider: (state, { payload }) => {
      state.provider = payload.provider;
    },
    logout: (state) => {
      localStorage.setItem(OPEN_SWAP_TOKEN, "");
      state.walletAddress = "";
    },
    updateSupportTokens: (state, { payload }) => {
      state.supportTokens = payload.tokens;
    },
  },
  extraReducers: (builder) => {
    // builder.addCase(connectWalletThunk.fulfilled, (state, { payload }) => {
    //   if (payload?.address) {
    //     state.walletAddress = payload.address;
    //     state.uuid = payload.uuid;
    //   }
    // });
  },
});

/* Types */
export interface ContractSliceState {
  walletAddress: string;
  provider: any;
  supportTokens: TTokenDTO[];
}
