import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { addDataModel } from "apis/dataCenter";
import MPBetaPublish from "../../components/AppPublish/MPBetaPublish";

export const MODAL_NAME = "PUBLISH_MP_MODEL_MODAL";

const PublishMPModal = observer(() => {
  const { modals, hideModal, currentTeamId } = useStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!modals[MODAL_NAME]) {
      form.setFieldsValue({});
    }
  }, [modals[MODAL_NAME]]);

  const handleOk = async () => {
    const isValid = await form.validateFields();
    if (!isValid) return;

    await addDataModel(currentTeamId, form.getFieldsValue().name);
    handleCancel();
    // refreshCurrentApp(currentAppId)
    return message.success("添加成功");
  };

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  return (
    <Modal
      title="发布试用小程序"
      visible={modals[MODAL_NAME]}
      footer={false}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      {modals[MODAL_NAME] && <MPBetaPublish />}
    </Modal>
  );
});

export default PublishMPModal;
