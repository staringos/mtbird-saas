import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import { inviteMember } from "apis/team";

export const MODAL_NAME = "INVITE_MEMBER_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const initialData = { phone: "" };

const InviteMemberModal = observer(() => {
  const { modals, hideModal, currentTeamId } = useStore();
  const [data, setData] = useState(initialData);

  const handleOk = async () => {
    if (isStringEmpty(data.phone))
      return message.error("请输入邀请用户手机号!");

    try {
      await inviteMember(currentTeamId, data.phone);
      handleCancel();
      return message.success("邀请成功，登录系统查看");
    } catch (e) {
      return message.error(e?.response?.data?.msg || e.message);
    }
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

  return (
    <Modal
      title="邀请加入团队"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form {...layout}>
        <Form.Item
          name="phone"
          label="用户手机号"
          rules={[{ required: true, message: "请输入邀请用户手机号!" }]}
        >
          <Input
            value={data.phone}
            onChange={(e) => handleChange("phone", e)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default InviteMemberModal;
