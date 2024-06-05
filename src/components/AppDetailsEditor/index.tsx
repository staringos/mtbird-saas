import React, { useState, useEffect } from "react";
import { Form, Typography, message } from "antd";
import UploadAvatar from "components/UploadAvatar";
import { EditableText } from "@mtbird/ui";
import { IApplication } from "types/entities/Application";
import { changeAppDetails } from "apis/app";

const { Text } = Typography;

interface IProps {
  nameDesc?: string;
  currentApp: IApplication;
  onChange: () => void;
}

const AppDetailsEditor = ({ currentApp, onChange, nameDesc }: IProps) => {
  const [tmpAvatar, setTmpAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (currentApp) {
      setTmpAvatar(currentApp.avatar);
    }
  }, [currentApp]);

  const handleDetailChange = (name: string) => {
    return async (value: string) => {
      try {
        await changeAppDetails(currentApp.id as any, { [name]: value } as any);
        message.success("操作成功");
        onChange();
        return true;
      } catch (e: any) {
        message.error(e.message);
      }
      return false;
    };
  };

  const handleAvatarChange = (e: Array<string>) => {
    if (e[0]) {
      handleDetailChange("avatar")(e[0]);
    } else {
      setTmpAvatar(e[0]);
    }
  };

  return (
    <>
      <Form.Item label="应用图标" required>
        <UploadAvatar
          files={tmpAvatar ? [tmpAvatar] : []}
          maxCount={1}
          onChange={handleAvatarChange}
        />
        <Text type="secondary">
          如已生成小程序，修改应用图标会自动修改小程序图标
        </Text>
      </Form.Item>
      <Form.Item label="应用名称" required>
        <EditableText
          text={currentApp?.name}
          onChange={handleDetailChange("name")}
          editable={true}
        />
        <Text type="secondary">
          {nameDesc || "如已生成小程序，修改名称会自动修改小程序名称"}
        </Text>
      </Form.Item>
      <Form.Item label="应用介绍" required>
        <EditableText
          text={currentApp?.desc}
          onChange={handleDetailChange("desc")}
          editable={true}
        />
        <Text type="secondary">
          如已生成小程序，修改介绍会自动修改小程序介绍
        </Text>
      </Form.Item>
      <Form.Item label="AppId">
        <Text>{currentApp?.id || "暂无"}</Text>
      </Form.Item>
    </>
  );
};

export default AppDetailsEditor;
