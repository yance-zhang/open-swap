import { Box, Stack } from "@mui/material";
import "./App.css";
import Chart from "./Chart";
import Layout from "./Layout";
import bgimg from "./assets/bgimg.svg";
import Swap from "./components/Swap/index";
import HideIcon from "./assets/hide.svg";
import { useContext, useEffect, useState } from "react";
import HideDarkIcon from "./assets/hide_dark.svg";
import ThemeContext from "./ThemeContext";
import BgLeft from "./assets/bg_left.svg";
import BgRight from "./assets/bg_right.svg";
import { getTokenListApi } from "./api";
import { checkNetwork, getBalanceByContractAddress } from "./api/contract";

function App() {
  const [showChart, setShowChart] = useState(false);
  const theme = useContext(ThemeContext);

  const toggleChart = () => {
    setShowChart(!showChart);
  };

  useEffect(() => {
    // getTokenListApi();
    // checkNetwork();
    // getBalanceByContractAddress(
    //   "0x72f9FfC9e63C5cFAC3690092c2cefc5fF846186C",
    //   "0x5091480F2829605d952E94F9C29C3757585F2ee4"
    // );

    setInterval(() => {}, 1000 * 60);
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        borderTop: "1px solid rgba(69, 72, 81, 0.1)",
        paddingTop: "40px",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          left: "50%",
          transform: "translate(-50%)",
          zIndex: -1,
          opacity: theme === "light" ? 1 : 0.5,
        }}
      >
        <img src={bgimg} style={{ height: "90vh", display: "block" }}></img>
      </Box>

      <Box
        sx={{
          zIndex: -1,
          position: "fixed",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
          opacity: theme === "light" ? 1 : 0.5,
        }}
      >
        <img
          src={BgLeft}
          style={{ height: "90vh", minHeight: 600, maxHeight: 900 }}
          alt=""
        />
      </Box>

      <Box
        sx={{
          zIndex: -1,
          position: "fixed",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          opacity: theme === "light" ? 1 : 0.5,
        }}
      >
        <img
          src={BgRight}
          style={{ height: "75vh", minHeight: 500, maxHeight: 750 }}
          alt=""
        />
      </Box>

      <Stack direction={"row"} justifyContent={"center"}>
        <Box
          sx={{
            width: "800px",
            position: "relative",
            background: "var(--content-bg)",
            padding: "20px",
            borderRadius: "20px",
            marginRight: "20px",
            display: showChart ? "flex" : "none",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              top: 20,
              right: 20,
              cursor: "pointer",
              color: "var(--light-color)",
            }}
            onClick={toggleChart}
          >
            Hide{" "}
            <img src={theme === "light" ? HideIcon : HideDarkIcon} alt="" />
          </Box>
          <Chart />
        </Box>
        <div className="max-h-[calc(100vh-120px)] w-full overflow-auto">
          <Swap openChart={toggleChart} />
        </div>
      </Stack>
    </Box>
  );
}

function SwapApp() {
  return (
    <Layout>
      <App />
    </Layout>
  );
}

export default SwapApp;
