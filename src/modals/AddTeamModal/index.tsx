import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { useStore } from "store";
import UploadAvatar from "@/components/UploadAvatar";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import { addTeam } from "apis";
import Storage from "utils/Storage";
import { CURRENT_TEAM_STORAGE_KEY } from "../../utils/constants";

export const MODAL_NAME = "ADD_TEAM_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const AddTeamModal = observer(() => {
  const { modals, hideModal, getUserInfo, setCurrentTeam } = useStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ name: "", avatar: "" });

  const handleOk = async () => {
    if (isStringEmpty(data.name)) {
      return message.error("请输入团队名称！");
    }
    setLoading(true);
    const res = await addTeam(data);
    Storage.setItem(CURRENT_TEAM_STORAGE_KEY, res.data?.id);
    handleCancel();
    await getUserInfo(true);
    setLoading(false);
    return message.success("团队添加成功");
  };

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  const handleNameChange = (e: any) => {
    setData({
      ...data,
      name: e.target.value,
    });
  };

  const handleFileChange = (files: string[]) => {
    setData({
      ...data,
      avatar: files[0],
    });
  };
  const files = data.avatar ? [data.avatar] : [];

  return (
    <Modal
      title="添加团队"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
    >
      <Form {...layout}>
        <Form.Item name="name" label="团队名称" rules={[{ required: true }]}>
          <Input value={data.name} onChange={handleNameChange} />
        </Form.Item>
        <Form.Item name="avatar" label="图标">
          <UploadAvatar
            files={files}
            onChange={handleFileChange}
            maxCount={1}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default AddTeamModal;
