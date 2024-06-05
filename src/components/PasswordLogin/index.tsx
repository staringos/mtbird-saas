import React, { FC, useState } from "react";
import { Form, Input, Button } from "antd";
import styles from "./style.module.less";
import random from "lodash/random";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { message } from "antd";

interface IProps {
  to?: string;
  appId?: string;
  redirectUrl?: string;
}

const PasswordLogin = observer(({ to, appId, redirectUrl }: IProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const store = useStore();

  const onFinish = async (data: any) => {
    try {
      const res = await store.login(username, password, to, appId);
      // console.log("[onFinish] res:", res, to);
      store.afterLogin(to, redirectUrl, res);
      // message.success("登录成功!");

      // if (!to || to === "mtbird") {
      //   location.href = "/";
      //   return;
      // }

      // if (to === "staringai") {
      //   const append =
      //     redirectUrl &&
      //     (redirectUrl.startsWith("http://") ||
      //       redirectUrl?.startsWith("https://"));
      //   location.href =
      //     `${process.env.NEXT_PUBLIC_STARINGAI_DASHBOARD}?t=${res}` +
      //     (append ? `&redirectUrl=${redirectUrl}` : "");
      // }
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleChange = (fn: Function, value: string) => {
    fn(value);
  };

  return (
    <Form
      className={styles.loginBoxForm}
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="用户名"
        name="username"
        rules={[{ required: true, message: "请输入用户名!" }]}
      >
        <Input onChange={(e) => handleChange(setUsername, e.target.value)} />
      </Form.Item>

      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, message: "请输入密码!" }]}
      >
        <Input.Password
          onChange={(e) => handleChange(setPassword, e.target.value)}
        />
      </Form.Item>

      <Button
        className={styles.loginBtn}
        type="primary"
        htmlType="submit"
        block
      >
        登录
      </Button>
    </Form>
  );
});

export default PasswordLogin;
