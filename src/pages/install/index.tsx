import React, { useState } from "react";
import styles from "./style.module.less";
import Image from "next/image";
import { Button, Col, Form, Input, Row } from "antd";
import UploadAvatar2 from "@/components/UploadAvatar2";
import { installer } from "@/apis/installer";

const Install = () => {
  const [form] = Form.useForm();
  const avatar = Form.useWatch("avatar", form);
  const [loading, setLoading] = useState(false);

  const handlerInstall = () => {
    setLoading(true);
    console.log(form.getFieldsValue());
    installer().then((res) => {
      location.href = "/"
    });
  };

  const handleFinish = () => {};

  const handleAvatarChange = () => {};

  return (
    <div className={styles.container}>
      <Image
        src={"https://mtbird-cdn.staringos.com/1vp4Kefd.png"}
        width={330}
        height={88}
        alt="logo"
      />
      <Form
        layout="vertical"
        className={styles.form}
        colon={false}
        name="basic"
        // labelCol={{ span: 6 }}
        // wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        form={form}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <div className={styles.content}>
          <div>
            <h1>系统配置</h1>
            <Form.Item
              label="系统名"
              name="PUBLIC_SYSTEM_NAME"
              rules={[{ required: true, message: "请输入系统名" }]}
            >
              <Input placeholder="请输入系统名" />
            </Form.Item>
            <Form.Item
              label="系统介绍"
              name="PUBLIC_SYSTEM_DESC"
              rules={[{ required: true, message: "请输入系统介绍" }]}
            >
              <Input placeholder="请输入系统介绍" />
            </Form.Item>
            <Form.Item
              label="Logo"
              name="PUBLIC_SYSTEM_LOGO"
              // rules={[{ required: true, message: "请输入Logo" }]}
            >
              <UploadAvatar2
                maxCount={1}
                accept="image/*"
                value={Array.isArray(avatar) ? avatar : [avatar]}
                onChange={handleAvatarChange}
              />
            </Form.Item>
            <Form.Item
              label="域名"
              name="PUBLIC_SYSTEM_DOMAIN"
              // rules={[{ required: true, message: "请输入域名" }]}
            >
              <Input />
            </Form.Item>
          </div>
          <div>
            <h1>技术配置</h1>

            <Form.Item
              label="数据库"
              name="DATABASE_URL"
              // rules={[{ required: true, message: "请输入系统名" }]}
            >
              <Input placeholder="请输入系统名" />
            </Form.Item>
            <Form.Item
              label="Redis"
              name="redis"
              // rules={[{ required: true, message: "请输入Redis" }]}
            >
              <Input placeholder="请输入redis" />
            </Form.Item>
          </div>
        </div>
      </Form>

      <footer>
        <Button
          className={styles.install}
          type="primary"
          onClick={handlerInstall}
          disabled={loading}
          loading={loading}
        >
          立即安装
        </Button>
      </footer>
    </div>
  );
};

export default Install;
