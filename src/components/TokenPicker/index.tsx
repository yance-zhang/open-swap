import { Box, Dialog, DialogTitle, Stack } from "@mui/material";
import React, { FC, useMemo, useState } from "react";
import "./index.css";
import CloseIcon from "@mui/icons-material/Close";
import ETH from "../../assets/tokens/eth.svg";
import USDT from "../../assets/tokens/usdt.svg";
import { Input, Modal } from "antd";
import { SearchOutlined } from "@mui/icons-material";
import BNB from "../../assets/tokens/bnb.svg";
import { TTokenDTO } from "../../types";
import {
  contractSlice,
  selectSupportTokens,
  useSelector,
} from "../../../lib/redux";

type TProps = {
  open: boolean;
  close: () => void;
  select: (token: TTokenDTO) => void;
};

const TokenPicker: FC<TProps> = ({ close, open, select }) => {
  const tokens = useSelector(selectSupportTokens);
  const [searchValue, setSearchValue] = useState<string>("");

  const handleSelect = (token: TTokenDTO) => {
    close();
    select(token);
  };

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      return (
        t.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
        t.symbol.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
      );
    });
  }, [searchValue, tokens]);

  return (
    <Modal
      open={open}
      onCancel={close}
      title="Select Token"
      closeIcon={<CloseIcon />}
      footer={null}
    >
      <Input
        className="token-picker-search"
        prefix={<SearchOutlined />}
        placeholder="Search by token name or address"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <div className="token-list">
        {filteredTokens.map((token, index) => (
          <Box
            className="token-item"
            display={"flex"}
            alignItems={"center"}
            gap={1}
            onClick={() => handleSelect(token)}
            key={index}
          >
            <Box className="token-icon">{token.icon || <img src={ETH} />}</Box>
            <Stack>
              <span className="token-name">{token.name}</span>
              <Box
                className="token-desc"
                display={"flex"}
                gap={"4px"}
                alignItems={"center"}
              >
                {token.symbol}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.00004 1.83325C4.32004 1.83325 1.33337 4.81992 1.33337 8.49992C1.33337 12.1799 4.32004 15.1666 8.00004 15.1666C11.68 15.1666 14.6667 12.1799 14.6667 8.49992C14.6667 4.81992 11.68 1.83325 8.00004 1.83325ZM7.33337 5.16658V6.49992H8.66671V5.16658H7.33337ZM7.33337 7.83325V11.8333H8.66671V7.83325H7.33337ZM2.66671 8.49992C2.66671 11.4399 5.06004 13.8333 8.00004 13.8333C10.94 13.8333 13.3334 11.4399 13.3334 8.49992C13.3334 5.55992 10.94 3.16659 8.00004 3.16659C5.06004 3.16659 2.66671 5.55992 2.66671 8.49992Z"
                    fill="currentColor"
                    fillOpacity="0.5"
                  />
                </svg>
              </Box>
            </Stack>
            <span className="token-number">{token.balance || 0}</span>
          </Box>
        ))}
      </div>
    </Modal>
  );
};

export default TokenPicker;
