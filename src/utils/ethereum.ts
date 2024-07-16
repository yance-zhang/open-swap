import { ethers } from "ethers";
import { web3Onboard } from "../main";

let Provider: any;
const detectEip6963 = () => {
  window.addEventListener("eip6963:announceProvider", (event: any) => {
    if (event.detail.info.uuid) {
      const { info, provider } = event.detail;
      if (info.name === "MetaMask") {
        Provider = provider;
      }
    }
  });

  window.dispatchEvent(new Event("eip6963:requestProvider"));
};
detectEip6963();

export const getEthereum = () => {
  return Provider;
};

export const checkNetwork = async () => {
  const [primaryWallet] = web3Onboard.state.get().wallets;
  let chainId: string = "";
  let provider: any;

  if (getEthereum()) {
    chainId = await getEthereum().request({
      method: "eth_chainId",
    });
  } else if (primaryWallet) {
    provider = new ethers.BrowserProvider(primaryWallet.provider);
    const network = await provider.getNetwork();
    chainId = "0x" + Number(network.chainId);
  }

  let checker = true;

  if (chainId !== import.meta.env.VITE_CHAIN_ID && getEthereum()) {
    const EthereumProvider = getEthereum();
    try {
      await EthereumProvider.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: import.meta.env.VITE_CHAIN_ID,
          },
        ],
      });
    } catch (error) {
      console.log(error);
      checker = false;
    }
  } else if (chainId !== import.meta.env.VITE_CHAIN_ID) {
    try {
      await provider?.send("wallet_addEthereumChain", [
        {
          chainId: import.meta.env.VITE_CHAIN_ID,
        },
      ]);
    } catch (error) {
      console.log(error);
      checker = false;
    }
  }
  return checker;
};
