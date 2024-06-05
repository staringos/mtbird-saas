import React, { useEffect, useState } from "react";
import { Form, Input, Button, Space, Row, Col } from "antd";
import styles from "./style.module.less";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { message } from "antd";
import { bindPhone } from "apis/user";
import { verifyPhoneNumber } from "utils";

interface IProps {
  onBindSuccess?: () => void;
  onBindFailed?: (msg?: string) => void;
}

const PhoneBind = observer(({ onBindFailed, onBindSuccess }: IProps) => {
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
    setLoadingLogin(true);

    bindPhone(code, phone)
      .then((res) => {
        if (res.code === 200) {
          onBindSuccess?.();
        } else {
          onBindFailed?.(res.msg);
        }
      })
      .catch((err) => {
        onBindFailed?.(err.message);
      })
      .finally(() => {
        setLoadingLogin(false);
      });
  };

  const handleChange = (fn: Function, value: string) => {
    fn(value);
  };

  const handleSendCode = async () => {
    if (loading || !!countDown) return;
    if (!verifyPhoneNumber(phone)) {
      return message.error("手机号格式不正确!");
    }
    setLoading(true);
    await store.sendCode(phone);
    setLoading(false);
    setCountDown(60);
  };

  const oldPhone = store.userInfo?.phone?.replace?.(/^(\d{3})\d{4}(\d+)/, '$1****$2');

  return (
    <Form
      className={styles.loginBoxForm}
      name="basic"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      style={{ margin: "24px auto" }}
      autoComplete="off"
    >
      {oldPhone && (
        <Form.Item
          label="原手机号"
          rules={[{ required: true, message: "请输入手机号" }]}
        >
          <Input disabled value={oldPhone} />
        </Form.Item>
      )}

      <Form.Item
        label="手机号"
        name="phone"
        rules={[{ required: true, message: "请输入手机号" }]}
      >
        <Input onChange={(e) => handleChange(setPhone, e.target.value)} />
      </Form.Item>

      <Form.Item label="验证码" required>
        <div className={styles.code}>
          <Form.Item
            name="code"
            rules={[{ required: true, message: "请输入验证码" }]}
            className={styles.codeInputWrapper}
          >
            <Input
              className={styles.codeInput}
              onChange={(e) => handleChange(setCode, e.target.value)}
            />
          </Form.Item>
          <Button
            style={{ marginLeft: "10px" }}
            onClick={handleSendCode}
            disabled={loading || !!countDown}
          >
            {loading ? "加载中.." : countDown ? `等待${countDown}s` : "验证码"}
          </Button>
        </div>
      </Form.Item>

      <Row justify="center">
        <Col>
          <Button
            className={styles.loginBtn}
            type="primary"
            htmlType="submit"
            disabled={loadingLogin}
          >
            {loadingLogin ? "加载中.." : "绑定手机"}
          </Button>
        </Col>
      </Row>
    </Form>
  );
});

export default PhoneBind;
