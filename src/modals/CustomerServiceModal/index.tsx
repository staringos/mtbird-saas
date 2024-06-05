import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Radio } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import { addPage } from "apis";
import isString from "lodash/isString";
import get from "lodash/get";
import { getPageDetails } from "../../apis";

export const MODAL_NAME = "CUSTOMER_SERVICE_MODAL";

const CopyPageModal = observer(() => {
  const { modals, hideModal } = useStore();

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  return (
    <Modal
      title="联系客户服务"
      visible={modals[MODAL_NAME]}
      onCancel={handleCancel}
      footer={false}
    >
      <p>试用微信扫码，添加您的专属服务顾问</p>
      <img src="/statics/images/ew-qrcode.jpeg" style={{ width: "200px" }} />
    </Modal>
  );
});

export default CopyPageModal;
