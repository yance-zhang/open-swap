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

const injected = injectedModule();

const wallets = [metamaskSDKWallet, injected];
const chains = [
  {
    id: "0x1",
    token: "ETH",
    label: "Ethereum Mainnet",
    rpcUrl: "https://eth-mainnet.public.blastapi.io",
  },
  {
    id: "0x5",
    token: "ETH",
    label: "Goerli",
    rpcUrl: "https://eth-goerli.public.blastapi.io",
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
  </Web3OnboardProvider>,
);
