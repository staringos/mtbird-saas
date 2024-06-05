import React from "react";
import { Form, Input, Select, Button, message, Typography, Space } from "antd";
import { addTeamCompany } from "apis/team";
import UploadAvatar from "@/components/UploadAvatar";
const { Text, Title } = Typography;

interface IProps {
  teamId: string;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

const LENGTH = {
  1: 18,
  2: 9,
  3: 15,
};

const CompanyCreate = ({ teamId, onSuccess, onCancel }: IProps) => {
  const [form] = Form.useForm();
  const codeType = Form.useWatch("codeType", form) as 1 | 2 | 3;
  const licenseUrl = Form.useWatch("licenseUrl", form);

  const CodeTypeOptions = [
    {
      label: "统一社会信用代码（18 位）",
      value: 1,
    },
    {
      label: "组织机构代码（9 位 xxxxxxxx-x)",
      value: 2,
    },
    {
      label: "营业执照注册号(15 位)",
      value: 3,
    },
  ];

  const handleFinish = async () => {
    const data = form.getFieldsValue();
    if (!data) return;
    if (!data.licenseUrl) return message.error("请上传营业执照照片!");

    const res = await addTeamCompany(teamId, { ...data, teamId });
    if (res) {
      onSuccess(res.data?.id);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={handleFinish}
      autoComplete="off"
    >
      <Title level={5}>创建主体</Title>
      <Form.Item
        label="公司名称"
        name="name"
        rules={[{ required: true, message: "请输入公司名称!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="公司编号类型"
        name="codeType"
        rules={[{ required: true, message: "请选择公司编号类型!" }]}
      >
        <Select options={CodeTypeOptions} />
      </Form.Item>
      <Form.Item
        label="公司编号"
        name="code"
        rules={[
          { required: true, message: "请输入公司编号!" },
          {
            max: LENGTH[codeType],
            min: LENGTH[codeType],
            message: `公司编号长度为${LENGTH[codeType]}位`,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="营业执照" name="licenseUrl" required>
        <UploadAvatar
          files={licenseUrl ? [licenseUrl] : []}
          onChange={(e) => form.setFieldValue("licenseUrl", e[0])}
          maxCount={1}
        />
      </Form.Item>
      <Form.Item
        label="法人姓名"
        name="legalPersonaName"
        rules={[{ required: true, message: "请输入法人姓名!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="法人身份证号"
        name="legalPersonaIdCard"
        rules={[
          { required: true, message: "请输入法人身份证号!" },
          {
            pattern:
              /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
            message: "请输入正确的身份证号",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="法人微信号"
        name="legalPersonaWechat"
        rules={[{ required: true, message: "请输入法人微信号!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
          <Button type="default" onClick={handleCancel}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CompanyCreate;
