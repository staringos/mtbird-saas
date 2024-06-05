import React, { useState } from "react";
import { Modal, message } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import PhoneBind from "../../components/PhoneBind";

export const MODAL_NAME = "PHONE_BIND_MODAL";

const PhoneBindModal = observer(() => {
  const { modals, hideModal } = useStore();
  const onBindCancel = () => {
    hideModal(MODAL_NAME);
  }

  const onBindFailed = (msg?: string) => {
    message.error(msg || "绑定失败");
  }

  const onBindSuccess = () => {
    onBindCancel();
  }

  return (
    <Modal
      title="绑定手机"
      open={modals[MODAL_NAME]}
      footer={null}
      onCancel={onBindCancel}
    >
      <PhoneBind onBindSuccess={onBindSuccess} onBindFailed={onBindFailed} />
    </Modal>
  );
});

export default PhoneBindModal;
