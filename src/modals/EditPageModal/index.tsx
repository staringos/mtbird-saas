import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Alert } from "antd";
import { useStore } from "store";
import UploadAvatar from "@/components/UploadAvatar";
import { observer } from "mobx-react-lite";
import { modifyPage } from "apis";

export const MODAL_NAME = "EDIT_PAGE_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const EditPageModal = observer(() => {
  const [form] = Form.useForm();
  const { modals, hideModal, getPages, currentAppId } = useStore();
  const page = modals[MODAL_NAME];

  useEffect(() => {
    if (page) {
      form.setFieldsValue(page);
    } else {
      form.setFieldsValue({});
    }
  }, [page]);

  const handleOk = async () => {
    if (!(await form.validateFields())) return;

    await modifyPage(page.id, form.getFieldsValue());
    handleCancel();
    getPages(currentAppId);
    return message.success("添加成功");
  };

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  const [files, setFiles] = useState(
    page.avatarShare ? [page.avatarShare] : []
  );

  const handleUpload = (e) => {
    const val = e?.[0];
    form.setFieldValue("avatarShare", val);
    if (val) {
      setFiles([val]);
    } else {
      setFiles([]);
    }
  };

  return (
    <Modal
      title="修改页面"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Alert
        message={
          <p>
            正确填写页面 标题、描述、tag
            等信息，有利于搜索引擎检索到页面，详细请查看文档：
            <a href="">sso优化</a>
          </p>
        }
        type="success"
      />
      <Form {...layout} form={form} style={{ marginTop: 10 }}>
        <Form.Item name="title" label="页面名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="desc" label="页面介绍" rules={[{ required: false }]}>
          <Input />
        </Form.Item>
        <Form.Item name="tags" label="页面TAG" rules={[{ required: false }]}>
          <Input />
        </Form.Item>
        <Form.Item name="avatarShare" label="分享头图">
          <UploadAvatar files={files} onChange={handleUpload} maxCount={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default EditPageModal;
