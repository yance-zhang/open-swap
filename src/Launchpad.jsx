import { useState, useEffect, useRef, useContext } from "react";
import { Box, Stack, TextField } from "@mui/material";
import styled from "@emotion/styled";
import Layout from "./Layout";
import ThemeContext from "./ThemeContext";
import rightArrow from "./assets/right-arrow.svg";
import rightArrowWhite from "./assets/right-arrow-white.svg";
import sidebg from "./assets/half-side-bg.png";
import nameToken from "./assets/launchpadbg.png";
import nameTicker from "./assets/nameTicker.png";
import uploadIcon from "./assets/cloud-upload.svg";
import uploadPic from "./assets/uploadPic.png";
import MyCropper from "./Cropper";
import Selected from "./assets/selected.svg";
import backIcon from "./assets/Back.svg";
import backIconWhite from "./assets/BackIcon-white.svg";
import lockIcon from "./assets/lockIcon.svg";
import eth from "./assets/eth.png";
import arbitrum from "./assets/arbitrum.png";
import agreeIcon from "./assets/agree.svg";
import tokenLogo from "./assets/tokenLogo.png";
const StepContent = (props) => {
  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      sx={{ marginBottom: "32px" }}
    >
      <Box
        sx={{
          fontWeight: "600",
          fontSize: "36px",
          marginRight: "45px",
          color: "var(--light-color)",
        }}
      >
        {props.step}
      </Box>
      <Box>
        <Box
          sx={{
            fontWeight: "600",
            fontSize: "36px",
            color: "var(--light-color)",
          }}
        >
          {props.title}
        </Box>
        <Box sx={{ color: "var(--sub-content)", textAlign: "left" }}>
          {props.content}
        </Box>
      </Box>
    </Stack>
  );
};
const THEME_KEY = "OPEN_SWAP_THEME";

const StyledInput = styled(TextField)({
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "none !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none !important",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    border: "none !important",
  },
  "& .MuiOutlinedInput-root": {
    padding: "0 0 0 20px",
    minHeight: "30px",
    background: "transparent",
  },
});
const LaunchPadContent = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(sessionStorage.getItem(THEME_KEY));
  const [tokenName, setTokenName] = useState("");
  const [tickerName, setTickerName] = useState("");
  const [tokenAmountSelected, setTokenAmountSelected] = useState(1);
  const [networkSelected, setNetworkSelected] = useState("ethereum");
  const inputRef = useRef();
  const tickerInputRef = useRef();
  const theme = useContext(ThemeContext);
  const ContinueButton = (props) => {
    const { color, text } = props;
    return (
      <Box
        sx={{
          width: "220px",
          height: "80px",
          borderRadius: "100px",
          background: color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          ...props.sx,
        }}
        onClick={() => {
          props.goNext();
          if (inputRef.current) inputRef.current.value = "";
        }}
      >
        <Box
          sx={{
            color: color === "yellow" ? "#000" : "rgba(192, 200, 209, 1)",
            fontWeight: "600",
            fontSize: "24px",
            marginRight: "20px",
          }}
        >
          {props.text ? props.text : "Continue"}
        </Box>
        <img src={color === "yellow" ? rightArrow : rightArrowWhite} />
      </Box>
    );
  };
  const goBack = () => {
    setStep((step) => step - 1);
  };
  const goNext = () => {
    setStep((step) => step - 1);
  };

  const GobackButton = () => {
    return (
      <Box
        sx={{ position: "absolute", left: "32px", cursor: "pointer" }}
        onClick={goBack}
      >
        <img src={theme === "light" ? backIconWhite : backIcon} />
      </Box>
    );
  };

  const firstStepContent = (
    <>
      <GobackButton />
      <Stack direction={"row"} sx={{ margin: "100px 12% 0 12%" }}>
        <Box sx={{ textAlign: "left", marginRight: "120px" }}>
          <Box
            sx={{
              fontWeight: "700",
              fontSize: "72px",
              lineHeight: "72px",
              color: "var(--light-color)",
            }}
          >
            Create your
          </Box>
          <Box
            sx={{
              fontWeight: "700",
              fontSize: "72px",
              lineHeight: "72px",
              color: "red",
              marginBottom: "42px",
            }}
          >
            own token
          </Box>
          <ContinueButton
            color={"yellow"}
            goNext={() => {
              setStep(2);
            }}
          />
        </Box>
        <Box>
          <StepContent
            step={1}
            title={"Define the basics"}
            content={"Name, ticker and logo"}
          />
          <StepContent
            step={2}
            title={"Work on economics"}
            content={"Total supply, airdrop recipients"}
          />
          <StepContent
            step={3}
            title={"Enable trading"}
            content={"Initial liquidity pool"}
          />
        </Box>
      </Stack>
      <Box sx={{ margin: "0 12% 0 6%" }}>
        <img style={{ display: "block" }} src={sidebg} />
      </Box>
    </>
  );
  const secondStepContent = (
    <>
      <GobackButton />

      <Box sx={{ margin: "0 12% 0 15%", position: "relative" }}>
        <Box>
          <img src={nameToken} style={{ height: "660px", display: "block" }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "100px",
            color: "#fff",
            zIndex: "100",
            top: "100px",
            left: "50%",
            transform: "translate(-50%)",
          }}
        >
          <Box
            sx={{
              fontWeight: "600",
              fontSize: "36px",
              marginBottom: "16px",
            }}
          >
            Name your Token
          </Box>
          <input
            ref={inputRef}
            size={tokenName.length || 1}
            style={{
              fontSize: "64px",
              color: "rgba(192, 200, 209, 1)",
              background: "transparent",
              border: "none",
              outline: "none",
              marginBottom: "20px",
            }}
            onChange={(e) => {
              setTokenName(e.target.value);
            }}
            onBlur={() => {
              inputRef.current.focus();
            }}
            autoFocus
          />
          <ContinueButton
            color={tokenName.length > 0 ? "yellow" : "black"}
            goNext={() => {
              setStep(3);
            }}
          ></ContinueButton>
        </Box>
      </Box>
    </>
  );
  const thirdStepContent = (
    <>
      <GobackButton />

      <Box sx={{ margin: "0 12% 0 16%", position: "relative" }}>
        <Box sx={{ marginLeft: "30px" }}>
          <img src={nameTicker} style={{ height: "660px", display: "block" }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "100px",
            color: "#fff",
            zIndex: "100",
            top: "100px",
            left: "50%",
            transform: "translate(-50%)",
          }}
        >
          <Box
            sx={{ fontWeight: "600", fontSize: "36px", marginBottom: "16px" }}
          >
            Type your ticker
          </Box>
          <input
            ref={tickerInputRef}
            size={tickerName.length || 1}
            style={{
              fontSize: "64px",
              color: "rgba(192, 200, 209, 1)",
              background: "transparent",
              border: "none",
              outline: "none",
              marginBottom: "20px",
            }}
            onChange={(e) => {
              setTickerName(e.target.value);
            }}
            onBlur={() => {
              tickerInputRef.current.focus();
            }}
            autoFocus
          />
          <ContinueButton
            color={tickerName.length > 0 ? "yellow" : "black"}
            goNext={() => {
              setStep(4);
            }}
          ></ContinueButton>
        </Box>
      </Box>
    </>
  );

  const fourthStepContent = (
    <MyCropper
      goNext={() => {
        setStep(5);
      }}
      goBack={goBack}
    />
  );
  const fifthStepContent = (
    <>
      <GobackButton />
      <Box
        sx={{
          margin: "50px auto 0 auto",
          width: "570px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            fontWeight: "600",
            fontSize: "48px",
            color: "var(--light-color)",
          }}
        >
          How many tokens do you want to produce?
        </Box>
        <Box
          sx={{
            textAlign: "left",
            height: "73px",
            width: "440px",
            border: "2px solid rgba(255, 219, 1, 1)",
            padding: "20px",
            display: "flex",
            borderRadius: "24px",
            justifyContent: "space-between",
            marginBottom: "8px",
            cursor: "pointer",
          }}
          onClick={() => {
            setTokenAmountSelected(1);
          }}
        >
          <Box>
            <Box
              sx={{
                fontWeight: "600",
                fontSize: "24px",
                color: "var(--light-color)",
              }}
            >
              21 Millions
            </Box>
            <Box
              sx={{
                fontWeight: "600",
                fontSize: "16px",
                color: "var(--sub-content)",
              }}
            >
              Everyone hail Satoshi
            </Box>
          </Box>
          {tokenAmountSelected === 1 && (
            <Box>
              <img src={Selected} />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            textAlign: "left",
            height: "73px",
            width: "440px",
            border: "2px solid rgba(255, 219, 1, 1)",
            padding: "20px",
            display: "flex",
            borderRadius: "24px",
            justifyContent: "space-between",
            marginBottom: "8px",
            cursor: "pointer",
          }}
          onClick={() => {
            setTokenAmountSelected(2);
          }}
        >
          <Box>
            <Box
              sx={{
                fontWeight: "600",
                fontSize: "24px",
                color: "var(--light-color)",
              }}
            >
              1 Trillion
            </Box>
            <Box
              sx={{
                fontWeight: "600",
                fontSize: "16px",
                color: "var(--sub-content)",
              }}
            >
              Imagine if it goes to $1
            </Box>
          </Box>
          {tokenAmountSelected === 2 && (
            <Box>
              <img src={Selected} />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            textAlign: "left",
            height: "73px",
            width: "440px",
            border: "2px solid rgba(255, 219, 1, 1)",
            padding: "20px",
            display: "flex",
            borderRadius: "24px",
            justifyContent: "space-between",
            marginBottom: "8px",
            cursor: "pointer",
          }}
          onClick={() => {
            setTokenAmountSelected(3);
          }}
        >
          <Box>
            <Box
              sx={{
                fontWeight: "600",
                fontSize: "24px",
                color: "var(--light-color)",
              }}
            >
              Custom
            </Box>
            <Box
              sx={{
                fontWeight: "600",
                fontSize: "16px",
                color: "var(--sub-content)",
              }}
            >
              Define your token’s supply Custom
            </Box>
          </Box>
          {tokenAmountSelected === 3 && (
            <Box>
              <img src={Selected} />
            </Box>
          )}
        </Box>
        <ContinueButton
          sx={{ width: "440px" }}
          color={"yellow"}
          goNext={() => {
            setStep(6);
          }}
        ></ContinueButton>
      </Box>
    </>
  );
  const sixthStepContent = (
    <>
      <GobackButton />
      <Box
        sx={{
          margin: "50px auto 0 auto",
          width: "570px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            fontWeight: "600",
            fontSize: "48px",
            color: "var(--light-color)",
          }}
        >
          Airdrop tokens to friends
        </Box>
        <Box
          sx={{
            fontWeight: "500",
            fontSize: "24px",
            color: "rgba(192, 200, 209, 1)",
            marginBottom: "80px",
          }}
        >
          Paste Ethereum address or ENS domain to send your newly created tokens
          to friends
        </Box>
        <Box>
          <input
            // size={tokenName.length || 1}
            placeholder="Paste address or ENS"
            style={{
              padding: "16px",
              fontSize: "20px",
              borderRadius: "20px",
              color: "var(--light-color)",
              background: "transparent",
              border: "1px solid var(--active-tab-color)",
              outline: "none",
              marginBottom: "20px",
              marginRight: "20px",
            }}
            onChange={(e) => {
              // setTokenName(e.target.value);
            }}
          />
          <input
            size={5}
            placeholder="0%"
            style={{
              padding: "16px",
              fontSize: "20px",
              borderRadius: "20px",
              color: "var(--light-color)",
              background: "transparent",
              border: "1px solid var(--active-tab-color)",
              outline: "none",
              marginBottom: "20px",
              marginRight: "20px",
            }}
            onChange={(e) => {
              // setTokenName(e.target.value);
            }}
            // autoFocus
          />
        </Box>
        <ContinueButton
          sx={{ width: "440px", marginTop: "40px" }}
          color={"yellow"}
          goNext={() => {
            setStep(7);
          }}
        ></ContinueButton>
      </Box>
    </>
  );
  const seventhStepContent = (
    <>
      <GobackButton />
      <Box
        sx={{
          margin: "50px auto 0 auto",
          width: "570px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            fontWeight: "600",
            fontSize: "48px",
            color: "var(--light-color)",
          }}
        >
          Create a market
        </Box>
        <Box
          sx={{
            fontWeight: "500",
            fontSize: "24px",
            color: "rgba(192, 200, 209, 1)",
            marginBottom: "80px",
          }}
        >
          Allocate part of the supply to create a market, so people can buy and
          sell your token for Ether
        </Box>

        <Box
          sx={{
            textAlign: "left",
            height: "73px",
            width: "440px",
            border: "2px solid rgba(255, 219, 1, 1)",
            padding: "20px",
            display: "flex",
            borderRadius: "24px",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Box>
                <Box
                  sx={{
                    fontWeight: "600",
                    fontSize: "24px",
                    color: "var(--light-color)",
                  }}
                >
                  HarryPotterOba...
                </Box>
                <Box
                  sx={{
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "var(--sub-content)",
                  }}
                >
                  Max: 1 Trillion
                </Box>
              </Box>
              <Box>
                <input
                  size={5}
                  placeholder="0%"
                  style={{
                    fontSize: "20px",
                    borderRadius: "20px",
                    color: "var(--light-color)",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                  }}
                  onChange={(e) => {
                    // setTokenName(e.target.value);
                  }}
                  // autoFocus
                />
                <Box sx={{ color: "var(--light-color)" }}>$0.00</Box>
              </Box>
            </Stack>
          </Box>
        </Box>
        <Box
          sx={{
            textAlign: "left",
            height: "73px",
            width: "440px",
            border: "2px solid rgba(255, 219, 1, 1)",
            padding: "20px",
            display: "flex",
            borderRadius: "24px",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Box>
                <Box
                  sx={{
                    fontWeight: "600",
                    fontSize: "24px",
                    color: "var(--light-color)",
                  }}
                >
                  Ether
                </Box>
                <Box
                  sx={{
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "var(--sub-content)",
                  }}
                >
                  Balance:1.31
                </Box>
              </Box>
              <Box>
                <input
                  size={5}
                  placeholder="0.00"
                  style={{
                    fontSize: "20px",
                    borderRadius: "20px",
                    color: "var(--light-color)",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                  }}
                  onChange={(e) => {
                    // setTokenName(e.target.value);
                  }}
                  // autoFocus
                />
                <Box sx={{ color: "var(--light-color)" }}>$0.00</Box>
              </Box>
            </Stack>
          </Box>
        </Box>
        <Box
          sx={{
            textAlign: "left",
            width: "440px",
            padding: "20px",
            display: "flex",
            borderRadius: "24px",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Box>
                <Box
                  sx={{
                    fontWeight: "600",
                    fontSize: "20px",
                    color: "var(--light-color)",
                  }}
                >
                  Lock liquidity
                </Box>
              </Box>
              <Box
                sx={{
                  background: "rgba(105, 113, 123, 1)",
                  padding: "3px",
                  width: "64px",
                  borderRadius: "33px",
                }}
              >
                <img style={{ display: "block" }} src={lockIcon} />
              </Box>
            </Stack>
          </Box>
        </Box>
        <ContinueButton
          sx={{ width: "440px" }}
          color={"yellow"}
          goNext={() => {
            setStep(9);
          }}
        ></ContinueButton>
      </Box>
    </>
  );
  const eighthStepContent = (
    <>
      <GobackButton />
      <Box
        sx={{
          margin: "50px auto 0 auto",
          width: "570px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            fontWeight: "600",
            fontSize: "48px",
            color: "var(--light-color)",
          }}
        >
          Choose Network
        </Box>
        <Box
          sx={{
            fontWeight: "500",
            fontSize: "24px",
            color: "rgba(192, 200, 209, 1)",
            marginBottom: "80px",
          }}
        >
          Ethereum Mainnet is more expensive, but historically more reliable
          with higher liquidity
        </Box>
        <Stack
          direction={"row"}
          justifyContent={"center"}
          sx={{ marginBottom: "100px" }}
        >
          <Box
            sx={{
              textAlign: "left",
              border:
                networkSelected === "ethereum"
                  ? "1px solid rgba(255, 219, 1, 1)"
                  : "1px solid transparent",
              padding: "20px",
              display: "flex",
              borderRadius: "24px",
              justifyContent: "center",
              margin: "8px",
              cursor: "pointer",
            }}
            onClick={() => {
              setNetworkSelected("ethereum");
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <img style={{ height: "100px" }} src={eth} />
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "24px",
                  color: "var(--light-color)",
                  marginBottom: "8px",
                }}
              >
                Ethereum
              </Box>
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "12px",
                  color: "rgba(192, 200, 209, 1)",
                }}
              >
                $20 to deploy, $3 per trade
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              color: "rgba(192, 200, 209, 1)",
              display: "flex",
              alignItems: "center",
            }}
          >
            or
          </Box>
          <Box
            sx={{
              textAlign: "left",
              border:
                networkSelected === "arbitrum"
                  ? "1px solid rgba(255, 219, 1, 1)"
                  : "1px solid transparent",
              padding: "20px",
              display: "flex",
              borderRadius: "24px",
              justifyContent: "center",
              margin: "8px",
              cursor: "pointer",
            }}
            onClick={() => {
              setNetworkSelected("arbitrum");
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <img src={arbitrum} />
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "24px",
                  color: "var(--light-color)",
                  marginBottom: "8px",
                }}
              >
                Arbitrum
              </Box>
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "12px",
                  color: "rgba(192, 200, 209, 1)",
                }}
              >
                $3 to deploy, $0.1 per trade
              </Box>
            </Box>
          </Box>
        </Stack>

        <ContinueButton
          sx={{ width: "440px" }}
          color={"yellow"}
          goNext={() => {
            setStep(1);
          }}
        ></ContinueButton>
      </Box>
    </>
  );
  const ninthStepContent = (
    <>
      <GobackButton />
      <Stack direction={"row"} sx={{ margin: "100px 10% 0 10%" }}>
        <Box sx={{ textAlign: "left", marginRight: "90px", width: "480px" }}>
          <Box
            sx={{
              fontWeight: "700",
              fontSize: "72px",
              lineHeight: "72px",
              color: "var(--light-color)",
              marginBottom: "20px",
            }}
          >
            Final Review
          </Box>
          <Box
            sx={{
              fontWeight: "500",
              fontSize: "24px",
              color: "rgba(192, 200, 209, 1)",
              // marginBottom: "42px",
            }}
          >
            You are deploying a token to Base’s mainnet. This action is
            irreversible, and you can’t edit it later!
          </Box>
          <ContinueButton
            color={"yellow"}
            sx={{ width: "200px", marginTop: "30px" }}
            text={"deploy"}
            goNext={() => {
              setStep(1);
            }}
          />
          <Stack direction={"row"} sx={{ marginTop: "40px" }}>
            <Box sx={{ marginRight: "12px" }}>
              <img src={agreeIcon} style={{ height: "36px" }} />
            </Box>
            <Box
              sx={{
                fontWeight: "500",
                fontSize: "24px",

                color: "var(--light-color)",
                // marginBottom: "42px",
              }}
            >
              I lock 10 Ethers for a week
            </Box>
          </Stack>
          <Stack direction={"row"} sx={{ marginTop: "16px" }}>
            <Box sx={{ marginRight: "12px" }}>
              <img src={agreeIcon} style={{ height: "36px" }} />
            </Box>
            <Box
              sx={{
                fontWeight: "500",
                fontSize: "24px",
                color: "var(--light-color)",
                // marginBottom: "42px",
              }}
            >
              I pay 0.003 ETH $10 for gas costs
            </Box>
          </Stack>
          <Stack direction={"row"} sx={{ marginTop: "16px" }}>
            <Box sx={{ marginRight: "12px" }}>
              <img src={agreeIcon} style={{ height: "36px" }} />
            </Box>
            <Box
              sx={{
                fontWeight: "500",
                fontSize: "24px",

                color: "var(--light-color)",
                // marginBottom: "42px",
              }}
            >
              I pay 5% supply fee of $Bitcoin
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            background: "var(--content-bg)",
            borderRadius: "40px",
            textAlign: "left",
            padding: "32px",
          }}
        >
          <Stack direction={"row"} sx={{ marginBottom: "32px" }}>
            <Box sx={{ marginRight: "12px" }}>
              <img src={tokenLogo} style={{ borderRadius: "50%" }} />
            </Box>
            <Box>
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "24px",
                  color: "var(--light-color)",
                }}
              >
                HarryPotterObamaSonic10...
              </Box>
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "rgba(105, 113, 123, 1)",
                }}
              >
                $Bitcoin
              </Box>
            </Box>
          </Stack>
          <Box>
            <Stack
              direction={"row"}
              alignItems={"center"}
              sx={{ marginBottom: "8px" }}
            >
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "rgba(105, 113, 123, 1)",
                  width: "140px",
                }}
              >
                Total supply
              </Box>
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "var(--light-color)",
                }}
              >
                1 Trillion
              </Box>
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"top"}
              sx={{ marginBottom: "8px" }}
            >
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "rgba(105, 113, 123, 1)",
                  width: "140px",
                }}
              >
                Liquidity Pool
              </Box>
              <Box>
                <Stack direction={"row"}>
                  <Box
                    sx={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "var(--light-color)",
                      marginRight: "8px",
                    }}
                  >
                    100 b $Bitcoin
                  </Box>
                  <Box
                    sx={{
                      fontWeight: "500",
                      fontSize: "16px",
                      color: "rgba(105, 113, 123, 1)",
                    }}
                  >
                    10%
                  </Box>
                </Stack>
                <Stack direction={"row"}>
                  <Box
                    sx={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "var(--light-color)",
                      marginRight: "8px",
                    }}
                  >
                    100 Ether
                  </Box>
                  <Box
                    sx={{
                      fontWeight: "500",
                      fontSize: "16px",
                      color: "rgba(105, 113, 123, 1)",
                    }}
                  >
                    $200.000
                  </Box>
                </Stack>
              </Box>
            </Stack>
            <Box
              sx={{
                color: "var(--light-color)",
                marginLeft: "130px",
                marginBottom: "30px",
                marginTop: "30px",
              }}
            >
              Locked for a week
            </Box>
            <Stack
              direction={"row"}
              alignItems={"top"}
              sx={{ marginBottom: "8px" }}
            >
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "rgba(105, 113, 123, 1)",
                  width: "140px",
                }}
              >
                Initial price
              </Box>
              <Box>
                <Box
                  sx={{
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "var(--light-color)",
                    marginRight: "8px",
                  }}
                >
                  0.00001 ETH / Ticker
                </Box>

                <Box
                  sx={{
                    fontWeight: "500",
                    fontSize: "16px",
                    color: "rgba(105, 113, 123, 1)",
                  }}
                >
                  $0.000001
                </Box>
              </Box>
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"top"}
              sx={{ marginBottom: "8px" }}
            >
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "rgba(105, 113, 123, 1)",
                  width: "140px",
                }}
              >
                Distribution
              </Box>
              <Box>
                <Stack
                  sx={{ height: "8px", marginBottom: "15px" }}
                  direction={"row"}
                >
                  <Box
                    sx={{
                      background: "rgba(191, 250, 0, 1)",
                      width: "60px",
                      borderRadius: "4px 0 0 4px",
                      marginRight: "2px",
                    }}
                  ></Box>
                  <Box
                    sx={{
                      background: "rgba(255, 0, 0, 1)",
                      width: "90px",
                      marginRight: "2px",
                    }}
                  ></Box>
                  <Box
                    sx={{
                      background: "rgba(226, 0, 248, 1)",
                      width: "84px",
                      borderRadius: "0 4px 4px 0",
                      marginRight: "2px",
                    }}
                  ></Box>
                </Stack>
                <Box>
                  <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    sx={{ marginBottom: "8px" }}
                  >
                    <Stack direction={"row"} alignItems={"center"}>
                      <Box
                        sx={{
                          borderRadius: "50%",
                          background: "rgba(191, 250, 0, 1)",
                          height: "15px",
                          width: "15px",
                          marginRight: "5px",
                        }}
                      ></Box>
                      <Box
                        sx={{
                          fontWeight: "600",
                          color: "var(--light-color)",
                        }}
                      >
                        Rest(You)
                      </Box>
                    </Stack>
                    <Stack
                      direction={"row"}
                      sx={{ width: "80px", justifyContent: "space-between" }}
                    >
                      <Box
                        sx={{ fontWeight: "600", color: "var(--light-color)" }}
                      >
                        850b
                      </Box>
                      <Box sx={{ color: "rgba(105, 113, 123, 1)" }}>85%</Box>
                    </Stack>
                  </Stack>
                  <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    sx={{ marginBottom: "8px" }}
                  >
                    <Stack direction={"row"} alignItems={"center"}>
                      <Box
                        sx={{
                          borderRadius: "50%",
                          background: "rgba(255, 0, 0, 1)",
                          height: "15px",
                          width: "15px",
                          marginRight: "5px",
                        }}
                      ></Box>
                      <Box
                        sx={{
                          fontWeight: "600",
                          color: "var(--light-color)",
                        }}
                      >
                        5 Friends
                      </Box>
                    </Stack>
                    <Stack
                      direction={"row"}
                      sx={{ width: "80px", justifyContent: "space-between" }}
                    >
                      <Box
                        sx={{ fontWeight: "600", color: "var(--light-color)" }}
                      >
                        50b
                      </Box>
                      <Box sx={{ color: "rgba(105, 113, 123, 1)" }}>5%</Box>
                    </Stack>
                  </Stack>
                  <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    sx={{ marginBottom: "8px" }}
                  >
                    <Stack direction={"row"} alignItems={"center"}>
                      <Box
                        sx={{
                          borderRadius: "50%",
                          background: "rgba(226, 0, 248, 1)",
                          height: "15px",
                          width: "15px",
                          marginRight: "5px",
                        }}
                      ></Box>
                      <Box
                        sx={{
                          fontWeight: "600",
                          color: "var(--light-color)",
                        }}
                      >
                        Market
                      </Box>
                    </Stack>
                    <Stack
                      direction={"row"}
                      sx={{ width: "80px", justifyContent: "space-between" }}
                    >
                      <Box
                        sx={{ fontWeight: "600", color: "var(--light-color)" }}
                      >
                        100b
                      </Box>
                      <Box sx={{ color: "rgba(105, 113, 123, 1)" }}>10%</Box>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </>
  );
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);
  if (step === 1) return firstStepContent;
  if (step === 2) return secondStepContent;
  if (step === 3) return thirdStepContent;
  if (step === 4) return fourthStepContent;
  if (step === 5) return fifthStepContent;
  if (step === 6) return sixthStepContent;
  if (step === 7) return seventhStepContent;
  if (step === 8) return eighthStepContent;
  if (step === 9) return ninthStepContent;
  else return <></>;
};

const LaunchPad = () => {
  return (
    <Layout>
      <LaunchPadContent />
    </Layout>
  );
};

export default LaunchPad;
