import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Info from "./Info.jsx";
import LaunchPad from "./Launchpad.jsx";
import Landing from "./components/Landing";
import "./index.css";
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import { Providers } from "../lib/providers";
import { SnackbarProvider } from "notistack";
import "normalize.css/normalize.css";
import metamaskSDK from "@web3-onboard/metamask";

// initialize the module with options
const metamaskSDKWallet = metamaskSDK({
  options: {
    extensionOnly: true,
    dappMetadata: {
      name: "Open Swap",
    },
  },
});

const INFURA_KEY = "b0caabe4b0bc4153a499536aa88a053d";
const injected = injectedModule();

const wallets = [metamaskSDKWallet, injected];
const chains = [
  {
    id: "0x1",
    token: "ETH",
    label: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  },
  {
    id: "0x5",
    token: "ETH",
    label: "Goerli",
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  },
];

export const web3Onboard = init({
  connect: {
    autoConnectAllPreviousWallet: true,
  },
  wallets,
  chains,
});
const router = createBrowserRouter([
  { path: "*", element: <App /> },
  { path: "/landing", element: <Landing /> },
  { path: "/Swap", element: <App /> },
  { path: "/Info", element: <Info /> },
  { path: "/LaunchPad", element: <LaunchPad /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Web3OnboardProvider web3Onboard={web3Onboard}>
    <Providers>
      <SnackbarProvider
        maxSnack={6}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        autoHideDuration={60 * 1000}
      >
        <RouterProvider router={router}></RouterProvider>
      </SnackbarProvider>
    </Providers>
  </Web3OnboardProvider>
);
