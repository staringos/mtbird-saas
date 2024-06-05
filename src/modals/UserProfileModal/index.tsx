import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import UploadAvatar from "components/UploadAvatar";
import { updateUserProfile } from "apis/user";
import BindWechat from "../../components/BindWechat";

export const MODAL_NAME = "USER_PROFILE_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const initialData = { nickname: "", avatar: "" };

const UserProfileModal = observer(() => {
  const { modals, hideModal, userInfo, getUserInfo } = useStore();
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (!userInfo) return;
    setData({
      nickname: userInfo.nickname || "",
      avatar: userInfo.avatar,
    });
  }, [userInfo]);

  const handleOk = async () => {
    if (isStringEmpty(data.nickname))
      return message.error("请输入邀请用户昵称!");
    if (isStringEmpty(data.avatar)) return message.error("请上传头像!");

    try {
      await updateUserProfile(data);
      handleCancel();
      getUserInfo(true);
      return message.success("修改成功!");
    } catch (e) {
      return message.error((e as any)?.response?.data?.msg || (e as any).message);
    }
  };

  const handleCancel = () => {
    setData(initialData);
    hideModal(MODAL_NAME);
  };

  const handleChange = (key: string, e: any) => {
    setData({
      ...data,
      [key]: e?.target ? e.target.value : e,
    });
  };

  const files = data.avatar ? [data.avatar] : [];

  return (
    <Modal
      title="修改用户信息"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form {...layout} style={{ marginTop: 10 }}>
        <Form.Item
          label="昵称"
          rules={[{ required: true, message: "请输入邀请用户昵称!" }]}
        >
          <Input
            value={data.nickname}
            onChange={(e) => handleChange("nickname", e)}
          />
        </Form.Item>
        <Form.Item name="avatar" label="头像">
          <UploadAvatar
            files={files}
            onChange={(e) => handleChange("avatar", e[0])}
            maxCount={1}
          />
        </Form.Item>
        <Form.Item name="avatar" label="绑定微信">
          <BindWechat />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default UserProfileModal;
