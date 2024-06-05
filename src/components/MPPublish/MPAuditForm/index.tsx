import React from "react";
import { Form, Typography, Input, Button, message } from "antd";
import { submitAudit } from "apis/wx";
import { IMiniProgramDto } from "@/types/entities/Wx";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface IProps {
  mp: IMiniProgramDto;
  onSuccess: () => void;
}

const MPAuditForm = ({ mp, onSuccess }: IProps) => {
  const [form] = Form.useForm();
  const handleAudit = async () => {
    const val = form.getFieldsValue();

    try {
      const res = await submitAudit(
        (mp as any).appId,
        val.versionDesc,
        val.feedbackInfo
      );
      console.log("audit res:", res);
      message.success("操作成功!");
      onSuccess();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  return (
    <Form form={form}>
      <Title level={5}>
        名称[{mp.officalName}]审核成功，提交信息进入版本审核
      </Title>
      <Form.Item label="版本说明" name="versionDesc">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item label="审核反馈" name="feedbackInfo">
        <TextArea rows={4} />
      </Form.Item>

      <Button type="primary" onClick={handleAudit}>
        提交审核
      </Button>
    </Form>
  );
};

export default MPAuditForm;
