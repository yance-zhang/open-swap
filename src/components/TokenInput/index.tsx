import { Box, Input, Stack, TextField } from "@mui/material";
import React, { FC, useMemo, useState } from "react";
import TokenPicker from "../TokenPicker";
import ETH from "../../assets/tokens/eth.svg";
import { TTokenDTO } from "../../types";
import { Token } from "@uniswap/sdk-core";
import { selectSupportTokens, useSelector } from "../../../lib/redux";
import { formatBalanceNumber } from "../../utils";

type TProps = {
  token?: Token;
  value: string;
  change: (value: string) => void;
  balance?: string;
  showQuickNumber?: boolean;
  changeToken: (token: TTokenDTO) => void;
};

const quickNumberList = [0.25, 0.5, 0.75, 1];

const TokenInput: FC<TProps> = ({
  token,
  value,
  change,
  showQuickNumber,
  changeToken,
}) => {
  const tokens = useSelector(selectSupportTokens);
  const [picker, setPicker] = useState<boolean>(false);

  const openPicker = () => {
    setPicker(true);
  };

  const { icon = "", balance = "" } = useMemo(() => {
    const target = tokens.find((t) => t.token_addr === token?.address);

    return target || ({} as TTokenDTO);
  }, [tokens, token]);

  return (
    <Box
      sx={{
        border: "1px solid rgba(69, 72, 81, 0.1)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "12px",
        background: "var(--swap-bg)",
      }}
    >
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Stack
          direction={"row"}
          gap={1}
          sx={{ color: "var(--light-color)", cursor: "pointer" }}
          onClick={openPicker}
          alignItems={"center"}
        >
          <Box display={"flex"} alignItems={"center"} width={24}>
            {icon || <img src={ETH} />}
          </Box>
          {token?.name}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="19"
            viewBox="0 0 18 19"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.58398 12.876C6.78189 13.1728 7.21811 13.1728 7.41603 12.876L10.4818 8.27735C10.7033 7.94507 10.4651 7.5 10.0657 7.5H3.93426C3.53491 7.5 3.29672 7.94507 3.51823 8.27735L6.58398 12.876Z"
              fill="currentColor"
            />
          </svg>
        </Stack>
        <Box sx={{ color: "var(--timepick-color)" }}>
          Balance: {formatBalanceNumber(Number(balance)) || 0}
        </Box>
      </Stack>
      <Input
        sx={{
          width: "100%",
          border: 0,
          margin: "20px 0",
          color: "var(--swap-input-color)",
          fontSize: "36px",
          textAlign: "left",
          fontWeight: 600,
          borderBottom: 0,
        }}
        placeholder="0.00"
        value={value}
        disableUnderline
        onChange={(e: any) => {
          const validStr = e.target.value.replace(
            /[^0-9]{0,1}(\d*(?:\.\d{0,18})?).*$/g,
            "$1"
          );
          change(validStr);
        }}
        onBlur={(e) => {
          change(`${Number(e.target.value)}`);
        }}
      />
      {showQuickNumber && (
        <Stack direction={"row"} justifyContent={"space-between"}>
          {quickNumberList.map((n) => (
            <Box
              key={n}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "90px",
                color: "var(--swap-shortcut)",
                fontSize: "12px",
                border: "1px solid var(--swap-shortcut-border)",
                cursor: "pointer",
              }}
              onClick={() => change((n * Number(balance)).toString())}
            >
              {(n * 100).toFixed(0)} %
            </Box>
          ))}
        </Stack>
      )}

      <TokenPicker
        open={picker}
        close={() => setPicker(false)}
        select={(token) => changeToken(token)}
      />
    </Box>
  );
};

export default TokenInput;
