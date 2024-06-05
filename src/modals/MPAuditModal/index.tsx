import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Button, Typography } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { getWxBetaFastApp } from "apis/wx";
import { IMiniProgramDto } from "types/entites/wx";
import MPSetCategories from "../../components/MPPublish/MPSetCategories";
import MPAuditForm from "../../components/MPPublish/MPAuditForm";
import MPDetailsSubmit from "../../components/MPDetailsSubmit";

export const MODAL_NAME = "MP_AUDIT_MODAL";

const initialData = { name: "", avatar: "", type: 1, desc: "" };

const MPAuditModal = observer(() => {
  const { modals, hideModal, currentAppId, currentApp, refreshCurrentApp } =
    useStore();
  const [data, setData] = useState(initialData);
  const [mp, setMp] = useState<IMiniProgramDto | undefined>();

  // const handleOk = async () => {
  //   handleCancel()
  //   return message.success("添加成功")
  // }

  const handleCancel = () => {
    setData(initialData);
    hideModal(MODAL_NAME);
  };

  const init = async () => {
    try {
      const wxMpRes = await getWxBetaFastApp(currentAppId);
      if (wxMpRes.data.qrcodeUrl) {
        setMp(wxMpRes.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    init();
  }, [currentAppId]);

  const handleSuccess = () => {
    handleCancel();
  };

  return (
    <Modal
      title="提交小程序审核"
      visible={modals[MODAL_NAME]}
      width="600px"
      footer={false}
      onCancel={handleCancel}
    >
      {/* 1. 设置名称 */}
      {(!mp?.isVerifyName || !mp?.isDetailsSetup) && (
        <MPDetailsSubmit
          currentApp={currentApp}
          mp={mp}
          onSuccess={init}
          onChange={refreshCurrentApp}
        />
      )}

      {/* 2. 设置类别 */}
      {mp?.isVerifyName && mp?.isDetailsSetup && !mp?.categories && (
        <MPSetCategories mp={mp} appId={currentAppId} onSuccess={init} />
      )}

      {/* 3. 提交审核 */}
      {mp?.isVerifyName && mp?.isDetailsSetup && mp?.categories && (
        <MPAuditForm mp={mp} onSuccess={handleSuccess} />
      )}
    </Modal>
  );
});

export default MPAuditModal;
