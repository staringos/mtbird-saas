import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Radio } from "antd";
import { useStore } from "store";
import UploadAvatar from "@/components/UploadAvatar";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import { addPage } from "apis";
import { PAGE_DATA_EMPTY, PAGE_TYPES } from "@/utils/constants";

export const MODAL_NAME = "ADD_PAGE_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const initialData = { title: "", avatar: "", type: 1, desc: "" };

const AddPageModal = observer(() => {
  const { modals, hideModal, getPages, currentAppId } = useStore();
  const [data, setData] = useState(initialData);

  const handleOk = async () => {
    if (isStringEmpty(data.title)) return message.error("请输入名称！");
    if (!currentAppId) return message.error("请选择应用");

    await addPage(currentAppId, data, PAGE_DATA_EMPTY);
    handleCancel();
    getPages(currentAppId);
    return message.success("添加成功");
  };

  const handleCancel = () => {
    setData(initialData);
    hideModal(MODAL_NAME);
  };

  const handleChange = (key: string, e: any) => {
    setData({
      ...data,
      [key]: e.target ? e.target.value : e,
    });
  };

  const files = data.avatar ? [data.avatar] : [];
  const plainOptions = PAGE_TYPES.map((cur, i) => ({ label: cur, value: i }));

  return (
    <Modal
      title="新建页面"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form {...layout}>
        <Form.Item name="title" label="页面名称" rules={[{ required: true }]}>
          <Input
            value={data.title}
            onChange={(e) => handleChange("title", e)}
          />
        </Form.Item>
        <Form.Item name="desc" label="页面介绍" rules={[{ required: false }]}>
          <Input value={data.desc} onChange={(e) => handleChange("desc", e)} />
        </Form.Item>
        <Form.Item name="type" label="页面类型" rules={[{ required: true }]}>
          <Radio.Group
            options={plainOptions}
            onChange={(e) => handleChange("type", e)}
            value={data.type}
          />
        </Form.Item>
        {/* <Form.Item
          name="avatar"
          label="头像"
        >
          <UploadAvatar files={files} onChange={(e) => handleChange('avatar', e[0])} maxCount={1} />
        </Form.Item> */}
      </Form>
    </Modal>
  );
});

export default AddPageModal;
