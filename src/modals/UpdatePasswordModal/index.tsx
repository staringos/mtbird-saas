import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import { updatePassword } from "apis/user";

export const MODAL_NAME = "PASSWORD_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const initialData = { password: "", repassword: "" };

const UpdatePasswordModal = observer(() => {
  const { modals, hideModal, currentTeamId } = useStore();
  const [data, setData] = useState(initialData);

  const handleOk = async () => {
    if (isStringEmpty(data.password)) return message.error("请输入新密码!");
    if (isStringEmpty(data.repassword)) return message.error("请再次输入密码!");

    try {
      await updatePassword(data.password);
      handleCancel();
      return message.success("密码修改成功!");
    } catch (e) {
      console.log("e:", e.response);
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
      title="修改密码"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form {...layout}>
        <Form.Item
          name="phone"
          label="新密码"
          rules={[{ required: true, message: "请输入新密码!" }]}
        >
          <Input
            type="password"
            value={data.password}
            onChange={(e) => handleChange("password", e)}
          />
        </Form.Item>
        <Form.Item
          name="repassword"
          label="再次输入密码"
          rules={[{ required: true, message: "请再次输入密码!" }]}
        >
          <Input
            type="password"
            value={data.repassword}
            onChange={(e) => handleChange("repassword", e)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default UpdatePasswordModal;
