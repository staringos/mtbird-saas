import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import styles from "./style.module.less";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { message } from "antd";
import { verifyPhoneNumber, getRegistryInfoFromQuery, debounce } from "utils";
import { AUTH_URLS } from "../../utils/constants";
import clsx from "@/utils/clsx";

interface IProps {
  to: string;
  appId?: string;
  redirectUrl?: any;
  query?: Record<string, string>;
}

const PhoneLogin = observer(({ to, appId, redirectUrl, query }: IProps) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countDown, setCountDown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const store = useStore();

  useEffect(() => {
    if (countDown) {
      setTimeout(() => {
        setCountDown((count) => count - 1);
      }, 1000);
    }
  }, [countDown]);

  const onFinish = async (data: any) => {
    try {
      setLoadingLogin(true);

      const res = await store.verify(
        phone,
        code,
        to,
        appId,
        getRegistryInfoFromQuery(query)
      );
      store.afterLogin(to, redirectUrl, res);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleChange = (fn: Function, value: string) => {
    fn(value);
  };

  const handleSendCode = debounce(async () => {
    if (loading || !!countDown) return;
    if (!verifyPhoneNumber(phone)) {
      return message.error("手机号格式不正确!");
    }
    setLoading(true);
    await store.sendCode(phone);
    setLoading(false);
    setCountDown(60);
  });

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
        label="手机号"
        name="phone"
        rules={[{ required: true, message: "请输入手机号!" }]}
      >
        <Input className="phoneInput" onChange={(e) => handleChange(setPhone, e.target.value)} />
      </Form.Item>

      <Form.Item label="验证码" name="code" className={clsx(styles.codeInputWrapper, "codeFormRow")}>
        <Input
          className={clsx(styles.codeInput, "codeInput")}
          onChange={(e) => setCode(e.target.value.slice(0,6))}
          maxLength={6}
        />
        <Button
          style={{ marginLeft: "10px" }}
          onClick={handleSendCode}
          disabled={loading || !!countDown}
          className={clsx("sendCode")}
        >
          {loading ? "加载中.." : countDown ? `等待${countDown}s` : "验证码"}
          {}
        </Button>
      </Form.Item>

      <Button
        className={clsx(styles.loginBtn, "loginBtn")}
        type="primary"
        htmlType="submit"
        disabled={loadingLogin}
      >
        {loadingLogin ? "加载中.." : "登录 / 注册"}
      </Button>
    </Form>
  );
});

export default PhoneLogin;
