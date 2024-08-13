import { Stack, Box } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import sun from "./assets/sun-line.svg";
import moon from "./assets/moon-line.svg";
import ThemeContext from "./ThemeContext";
import { useConnectWallet, useAccountCenter } from "@web3-onboard/react";
import LogoLight from "./assets/Logo_light.svg";
import LogoDark from "./assets/Logo_dark.svg";
import { BrowserProvider } from "ethers";
import { contractSlice, loginSuccessThunk, useDispatch } from "../lib/redux";
import { getEthereum } from "./utils/ethereum";
import { getTokenListApi } from "./api";
import { checkNetwork } from "./api/contract";

const ActiveTab = (props) => {
  return (
    <Box
      sx={{
        padding: "0 16px",
        background: "var(--active-tab-bg)",
        // width: "100px",
        height: "44px",
        fontWeight: "600",
        borderRadius: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "16px",
        color: "var(--active-tab-color)",
        cursor: "pointer",
        // border: " 1px solid var(--active-tab-color)",
      }}
      {...props}
    >
      {props.children}
    </Box>
  );
};

const THEME_KEY = "OPEN_SWAP_THEME";

const NormalTab = (props) => {
  return (
    <Box
      sx={{
        // marginLeft: "16px",
        padding: "0 16px",
        height: "44px",
        // background: "var(--tab-bg)",
        color: "var(--tab-color)",
        // width: "100px",
        display: "flex",
        justifyContent: "center",
        borderRadius: "20px",

        alignItems: "center",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
      }}
      {...props}
    >
      {props.children}
    </Box>
  );
};

const light = {
  "--layout-bg": "rgba(249, 249, 249, 1)",
  "--content-bg": "rgba(255,255,255,0.8)",
  "--light-color": "#000",
  "--bg-color": "#fff",
  "--active-tab-bg": "#fff",
  "--active-tab-color": "rgba(26, 26, 27, 1)",
  "--tab-bg": "#fff",
  "--tab-color": "rgba(26, 26, 27, 1)",
  "--sub-content": "rgb(91 99 108)",
  "--timepick-color": "rgba(26, 26, 27, 0.5)",
  "--timepicker-active-color": "rgba(26, 26, 27, 1)",
  "--connect-wallet": "rgba(26, 26, 27, 1)",
  "--tabs": "transparent",
  "--swap-tab": "#fff",
  "--swap-bg": "#fff",
  "--swap-input-color": "rgba(26, 26, 27, 0.3)",
  "--swap-shortcut": "rgba(69, 72, 81, 0.5)",
  "--swap-shortcut-border": "rgba(69, 72, 81, 0.1)",
  "--info-placeholder": "rgba(26, 26, 27, 0.6)",
  "--active-tokeninfo-bg":
    "linear-gradient(0deg, rgba(255, 138, 2, 0.05), rgba(255, 138, 2, 0.05)),linear-gradient(0deg, #FFFFFF, #FFFFFF)",
  "--swap-button": "#000",
  "--landing-text": "#1a1a1b",
  "--landing-card-bg": "#fff",
  "--landing-slogan": "linear-gradient(97.82deg, #1a1a1b 0%, #675000 56.04%)",
};
const dark = {
  "--layout-bg": "#000",
  "--light-color": "#fff",
  "--content-bg": "rgba(34, 35, 40, 0.8)",
  "--bg-color": "#000",
  "--active-tab-bg": "#000",
  "--active-tab-color": "#fff",
  "--tab-bg": "#fff",
  "--tab-color": "rgba(26, 26, 27, 1)",
  "--sub-content": "rgba(192, 200, 209, 1)",
  "--timepick-color": "rgba(255, 255, 255, 0.5)",
  "--timepicker-active-color": "#fff",
  "--connect-wallet": "rgba(255, 138, 2, 1)",
  "--tabs": "rgba(69, 72, 81, 0.3)",
  "--swap-tab": "rgba(43, 45, 52, 1)",
  "--swap-bg": "rgba(69, 72, 81, 0.3)",
  "--swap-input-color": "rgba(255, 255, 255, 0.3)",
  "--swap-shortcut": "rgba(255, 255, 255, 0.5)",
  "--swap-shortcut-border": "rgba(69, 72, 81, 0.3)",
  "--info-placeholder": "rgba(255, 255, 255, 0.6)",
  "--active-tokeninfo-bg":
    "linear-gradient(0deg, #2B2D34, #2B2D34),linear-gradient(0deg, rgba(255, 138, 2, 0.05), rgba(255, 138, 2, 0.05))",
  "--swap-button": "linear-gradient(91.02deg, #FF9900 0%, #FCFF7C 100%)",
  "--landing-text": "rgba(255, 255, 255, 0.5)",
  "--landing-card-bg": "#222328CC",
  "--landing-slogan": "linear-gradient(97.82deg, #FFFFFF 0%, #FFF2D1 56.04%)",
};
const themes = { light, dark };

const Layout = (props) => {
  const path =
    window.location.pathname.slice(1) === ""
      ? "Swap"
      : window.location.pathname.slice(1);

  const [tabIndex, setTabIndex] = useState(0);
  const [theme, setTheme] = useState(
    sessionStorage.getItem(THEME_KEY) || "light"
  );
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const updateAccountCenter = useAccountCenter();
  const ConnectWalletButton = () => {
    if (theme === "light")
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "var(--connect-wallet)",
            background: "rgba(243, 243, 243, 1)",
            border: "1px solid rgba(69, 72, 81, 0.1)",
            borderRadius: "8px",
            cursor: "pointer",
            padding: "1px 16px",
            height: "36px",
          }}
          onClick={() => {
            wallet ? disconnect(wallet) : connect();
          }}
        >
          {wallet
            ? `${wallet.accounts[0].address.slice(
                0,
                6
              )}...${wallet.accounts[0].address.slice(-4)}`
            : "Connect Wallet"}
        </Box>
      );
    else
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "var(--connect-wallet)",
            background: "linear-gradient(274.38deg, #FCFF7C 0%, #FF9900 100%)",
            cursor: "pointer",
            height: "36px",
            borderRadius: "8px",
            padding: "1px",
          }}
          onClick={() => {
            wallet ? disconnect(wallet) : connect();
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#000",
              height: "34px",
              padding: "1px 16px",
              borderRadius: "8px",
            }}
          >
            {wallet
              ? `${wallet.accounts[0].address.slice(
                  0,
                  6
                )}...${wallet.accounts[0].address.slice(-4)}`
              : "Connect Wallet"}
          </Box>
        </Box>
      );
  };
  const dispatch = useDispatch();

  const changeTheme = (t) => {
    const nextTheme = themes[t];
    setTheme(t);

    sessionStorage.setItem(THEME_KEY, t);
    Object.keys(nextTheme).forEach((key) => {
      document.documentElement.style.setProperty(key, nextTheme[key]);
    });
    document.documentElement.classList = [t];
  };

  const fetchTokens = async () => {
    try {
      const res = await getTokenListApi();

      if (res.errno === 0) {
        dispatch(
          contractSlice.actions.updateSupportTokens({ tokens: res.data })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    changeTheme(theme);
  }, [theme]);

  useEffect(() => {
    updateAccountCenter({ enabled: false });
    fetchTokens();
    // checkNetwork();
  }, []);

  useEffect(() => {
    let timer;
    if (wallet) {
      timer = setInterval(() => {
        dispatch(loginSuccessThunk({ address: wallet.accounts[0].address }));
      }, 5000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [wallet]);

  return (
    <Box>
      <Stack
        direction={"row"}
        position={"relative"}
        justifyContent={"space-between"}
        sx={{ marginBottom: "20px", px: "24px" }}
      >
        <Box
          style={{
            fontWeight: "bold",
            fontSize: "24px",
            color: theme === "light" ? "black" : "white",
          }}
        >
          Open Swap
          {/* <img
            style={{ display: "block" }}
            src={theme === "light" ? LogoLight : LogoDark}
          /> */}
        </Box>
        <Stack
          direction={"row"}
          sx={{
            border: "1px solid rgba(69, 72, 81, 0.1)",
            borderRadius: "20px",
            height: "46px",
            background:
              theme === "light" ? "rgba(243, 243, 243, 1)" : "#2b2d34",
          }}
          className="hidden lg:flex"
        >
          {["Swap", "Info"].map((tab, index) => {
            if (path === tab) {
              return <ActiveTab key={index}>{tab}</ActiveTab>;
            } else
              return (
                <Link to={`/${tab}`} key={index}>
                  <NormalTab
                    onClick={() => {
                      setTabIndex(index);
                    }}
                    style={{
                      color: theme === "light" ? "#BABABA" : "#FFFFFF4D",
                    }}
                    key={index}
                  >
                    {tab}
                  </NormalTab>
                </Link>
              );
          })}
        </Stack>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "46px",
            // position: "absolute",
            // right: "32px",
            // top: "0",
            // top: "50%",
            // transform: "translate(0,-50%)",
          }}
        >
          <Box
            sx={{ cursor: "pointer", marginRight: "8px" }}
            onClick={() => {
              setTheme((theme) => {
                if (theme === "light") return "dark";
                return "light";
              });
            }}
          >
            <img
              style={{ height: "24px", display: "block" }}
              src={theme === "light" ? moon : sun}
            />
          </Box>
          <ConnectWalletButton />
        </Box>
      </Stack>

      <Stack
        direction={"row"}
        sx={{
          border: "1px solid rgba(69, 72, 81, 0.1)",
          borderRadius: "20px",
          height: "46px",
          width: "140px",
          background: theme === "light" ? "rgba(243, 243, 243, 1)" : "#2b2d34",
        }}
        className="flex lg:hidden mx-auto mb-5"
      >
        {["Swap", "Info"].map((tab, index) => {
          if (path === tab) {
            return <ActiveTab key={index}>{tab}</ActiveTab>;
          } else
            return (
              <Link to={`/${tab}`} key={index}>
                <NormalTab
                  onClick={() => {
                    setTabIndex(index);
                  }}
                  style={{
                    color: theme === "light" ? "#BABABA" : "#FFFFFF4D",
                  }}
                  key={index}
                >
                  {tab}
                </NormalTab>
              </Link>
            );
        })}
      </Stack>
      <ThemeContext.Provider value={theme}>
        {props.children}
      </ThemeContext.Provider>
    </Box>
  );
};

export default Layout;
