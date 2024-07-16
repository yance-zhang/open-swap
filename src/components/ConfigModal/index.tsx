import { Input, Modal } from "antd";
import React, { FC } from "react";
import CloseIcon from "@mui/icons-material/Close";

type TProps = {
  open: boolean;
  close: () => void;
  confirm: (data: any) => void;
};

const ConfigModal: FC<TProps> = ({ open, close }) => {
  return (
    <Modal
      title="Swap Config"
      open={open}
      onCancel={close}
      closeIcon={<CloseIcon />}
      footer={null}
    >
      <div className="slippage">
        <span className="label">Max.slippage</span>
        <Input defaultValue={0.05} suffix={"%"} />
      </div>
    </Modal>
  );
};

export default ConfigModal;
