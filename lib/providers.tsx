"use client";

/* Core */
import { Provider } from "react-redux";

/* Instruments */
import { reduxStore } from "./redux";
import { persistStore } from "redux-persist";
import { useEffect } from "react";
import React from "react";

export const Providers = (props: React.PropsWithChildren) => {
  useEffect(() => {
    // persistStore(reduxStore);
  }, []);

  return <Provider store={reduxStore}>{props.children}</Provider>;
};
