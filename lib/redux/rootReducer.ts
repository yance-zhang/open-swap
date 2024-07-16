/* Instruments */
import storage from "redux-persist/lib/storage";
import { contractSlice } from "./slices";
import { persistReducer } from "redux-persist";

export const reducer = {
  contract: persistReducer({ key: "contract", storage }, contractSlice.reducer),
};
