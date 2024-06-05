import React, { useEffect } from "react";
import { Modal, Form, Input, message, Alert, Button } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { bindDomain } from "apis/app";
import { validHostnameRegex } from "@/utils/regEx";

export const MODAL_NAME = "BIND_DOMAIN_NAME";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const BindDomainModal = observer(() => {
  const { modals, hideModal, refreshCurrentApp, currentAppId, currentApp } =
    useStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentApp?.domain) {
      form.setFieldsValue(currentApp.domain);
    } else {
      form.setFieldsValue({
        domainName: "",
        certKey: "",
        certPem: "",
      });
    }
  }, [currentApp]);

  useEffect(() => {
    if (!modals[MODAL_NAME]) {
      form.setFieldsValue({});
    }
  }, [modals[MODAL_NAME]]);

  const handleOk = async () => {
    const isValid = await form.validateFields();
    if (!isValid) return;
    if (!currentAppId) return message.error("请选择应用");

    await bindDomain(currentAppId, form.getFieldsValue());
    handleCancel();
    refreshCurrentApp(currentAppId);
    return message.success("添加成功");
  };

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  return (
    <Modal
      title="绑定域名"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Alert
        message={
          <span>
            设置域名详细操作步骤，可以参考
            <Button
              type="link"
              href="https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E7%BB%91%E5%AE%9A%E5%9F%9F%E5%90%8D--page&f=CMTBindDomainModal"
            >
              这个文档
            </Button>
            ; 申请免费证书或者需要技术支持，请联系客服 👉
          </span>
        }
        type="warning"
        showIcon
        closable
      />
      <br />
      <Form {...layout} form={form}>
        <Form.Item
          name="domainName"
          label="域名"
          rules={[
            { required: true, message: "域名不能为空!" },
            { pattern: validHostnameRegex, message: "域名格式不正确!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="certKey"
          label="证书(.key)"
          rules={[{ required: true, message: "证书(.key) 不能为空!" }]}
          extra="以 -----BEGIN PRIVATE KEY----- 开头的文件."
        >
          <Input.TextArea style={{ height: 130 }} />
        </Form.Item>
        <Form.Item
          name="certPem"
          label="证书(.pem / .crt)"
          rules={[{ required: true, message: "证书(.pem / .crt) 不能为空!" }]}
          extra="以 -----BEGIN CERTIFICATE----- 开头的文件."
        >
          <Input.TextArea style={{ height: 130 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default BindDomainModal;
