import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { addDataModel } from "apis/dataCenter";

export const MODAL_NAME = "ADD_DATA_MODEL_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const AddDataModelModal = observer(() => {
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
      title="添加数据模型"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form {...layout} form={form}>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: "域名不能为空!" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default AddDataModelModal;
