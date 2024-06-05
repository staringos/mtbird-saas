import React, { useEffect, useState } from "react";
import { Form, Input, message, Button, Typography } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../../utils";
import UploadAvatar from "components/UploadAvatar";
import { updateTeamProfile } from "apis/team";
import ManagerLayout from "../../../layout/ManagerLayout";
import TeamVersionBadge from "../../../components/TeamVersionBadge";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const initialData = { name: "", avatar: "" };

const TeamBasic = observer(() => {
  const { currentTeam, refreshCurrentTeam, currentTeamId } = useStore();
  const [data, setData] = useState(initialData);

  useEffect(() => {
    console.log("currentTeam:", currentTeam);
    if (!currentTeam) return;
    setData({
      name: currentTeam.name,
      avatar: currentTeam.avatar,
    });
  }, [currentTeam]);

  const handleOk = async () => {
    if (isStringEmpty(data.name)) return message.error("请输入团队名称!");
    if (isStringEmpty(data.avatar)) return message.error("请上传头像!");

    try {
      await updateTeamProfile(currentTeamId, data.name, data.avatar);
      refreshCurrentTeam();
      return message.success("修改成功!");
    } catch (e) {
      return message.error(e?.response?.data?.msg || e.message);
    }
  };

  const handleChange = (key: string, e: any) => {
    setData({
      ...data,
      [key]: e.target ? e.target.value : e,
    });
  };

  const files = data.avatar ? [data.avatar] : [];

  return (
    <ManagerLayout type="team">
      <Form {...layout} colon={false}>
        <Form.Item label=" ">
          <Typography>
            <Typography.Title level={3}>团队信息</Typography.Title>
          </Typography>
        </Form.Item>
        <Form.Item
          label="团队名称"
          rules={[{ required: true, message: "请输入团队名称!" }]}
        >
          <Input value={data.name} onChange={(e) => handleChange("name", e)} />
        </Form.Item>
        <Form.Item label="团队级别">
          <TeamVersionBadge />
        </Form.Item>
        <Form.Item name="avatar" label="头像">
          <UploadAvatar
            files={files}
            onChange={(e) => handleChange("avatar", e[0])}
            maxCount={1}
          />
        </Form.Item>
        <Form.Item label=" ">
          <Button type="primary" onClick={handleOk}>
            更新
          </Button>
        </Form.Item>
      </Form>
    </ManagerLayout>
  );
});

export default TeamBasic;
