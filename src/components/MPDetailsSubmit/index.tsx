import React, { useEffect, useState } from "react";
import { Button, Form, message, Typography, Input } from "antd";
import { IApplication } from "types/entities/Application";
import { submitAppDetails } from "apis/wx";
import AppDetailsEditor from "../AppDetailsEditor";

// const { Text } = Typography;

interface IProps {
  mp: any;
  onSuccess: () => void;
  currentApp: IApplication;
  onChange: () => void;
}

const MPDetailsSubmit = ({ mp, onSuccess, currentApp, onChange }: IProps) => {
  // const [name, setName] = useState(currentApp.name)

  // useEffect(() => {
  //   console.log("currentApp:", currentApp)
  //   if (currentApp && currentApp.name && !name) {
  //     setName(currentApp.name)
  //   }
  // }, [currentApp])

  const handleSetName = async () => {
    if (!currentApp.name || currentApp.name.length < 2)
      return message.error("请正确填写小程序名称，名称不能少于两个字");
    if (currentApp.name.indexOf("小程序") !== -1)
      return message.error("请正确填写小程序名称，名称中不能包含‘小程序’");
    if (!currentApp.desc) return message.error("请填写小程序介绍");
    if (!currentApp.avatar)
      return message.error("请正确填写小程序名称，名称不能少于四个字");

    try {
      await submitAppDetails(currentApp.id!);
      message.success("小程序基本信息设置成功!");
      onSuccess();
    } catch (e: any) {
      console.log("e:", e, e.response);
      message.error(e.message);
    }
  };

  return (
    <>
      {/* <Form.Item label="小程序名称" rules={[{ required: true }]} required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Text type="secondary">小程序名称需要是唯一的，不能少于两个字，如提示品牌名称需要审核，可以联系客服提供品牌商标或证明文件办理</Text>
      </Form.Item> */}
      <AppDetailsEditor
        currentApp={currentApp}
        nameDesc="小程序名称需要是唯一的，不能少于两个字，如提示品牌名称需要审核，可以联系客服提供品牌商标或证明文件办理"
        onChange={onChange}
      />
      <Button type="primary" onClick={handleSetName}>
        确认应用信息，提交名称审核
      </Button>
    </>
  );
};

export default MPDetailsSubmit;
