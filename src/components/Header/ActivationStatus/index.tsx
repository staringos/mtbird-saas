import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styles from "./styles.module.less";
import { Button, Form, FormProps, Input, Modal, Tag, message } from "antd";
import { useStore } from "store";
import { activation } from "@/apis/installer";

type FieldType = {
  domain: string;
  code: string;
};

const ActivationStatus = observer(() => {
  const { activationStatus, getActivationStatus } = useStore();
  const [activationModal, setActivationModal] = useState(false);

  const onActivation = () => {
		if (activationStatus) return;
    setActivationModal(true);
  };

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    activation(values).then(res => {
			if (res.code === 200) {
				message.success(`${values.domain} 激活成功`);
				getActivationStatus();
        setActivationModal(false);
			} else {
				console.log(res)
			}
		}).catch((err) => {
			message.error(err?.response?.data?.msg || '激活失败，请联系客服')
		})
  };

	useEffect(() => {
		getActivationStatus();
	}, [])

  return (
    <div onClick={onActivation}>
      <div>{activationStatus ?  <Tag color="#87d068">已激活</Tag> : <Tag color="#f50" style={{ cursor: 'pointer' }}>未激活</Tag>}</div>
      <Modal
        open={activationModal}
        title="激活系统"
        closable
        onCancel={() => setActivationModal(false)}
				footer={null}
      >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="域名"
            name="domain"
            rules={[{ required: true, message: "Please input your domain!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="激活码"
            name="code"
            rules={[{ required: true, message: "Please input your code!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              激活
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default ActivationStatus;
