/* Instruments */
import type { ReduxState } from "../../store";

export const userAddress = (state: ReduxState) => state.contract.walletAddress;

export const selectProvider = (state: ReduxState) => state.contract.provider;

export const selectSupportTokens = (state: ReduxState) =>
  state.contract.supportTokens;
