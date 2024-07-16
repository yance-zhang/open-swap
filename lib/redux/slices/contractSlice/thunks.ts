import { getTokenListApi } from "../../../../src/api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { selectSupportTokens } from "./selectors";
import { contractSlice } from "./contractSlice";

export const loginSuccessThunk = createAppAsyncThunk(
  "contract/loginSuccess",
  async ({ address }: { address: string }, { dispatch, getState }) => {
    try {
      let tokens = selectSupportTokens(getState());

      if (!tokens || tokens.length === 0) {
        const res = await getTokenListApi();
        if (res.errno === 0) {
          tokens = res.data;
        }
      }

      // const tokenWithBalance: TTokenDTO[] = [];
      // for (let i = 0; i < tokens.length; i++) {
      //   const token = tokens[i];
      //   const balance = await getBalanceByContractAddress(
      //     token.token_addr,
      //     address
      //   );
      //   tokenWithBalance.push({ ...token, balance });
      // }

      dispatch(contractSlice.actions.updateSupportTokens({ tokens }));
      dispatch(contractSlice.actions.setWalletAddress({ address }));
    } catch (error) {
      console.log(error);
    }
  }
);
