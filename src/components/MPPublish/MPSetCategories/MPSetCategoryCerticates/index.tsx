import React from "react";
import { Form, Typography } from "antd";
import UploadAvatar from "components/UploadAvatar";

const { Text } = Typography;

interface IProps {
  restField: any;
  category: any;
  form: any;
  name: string | number;
  categoryValue: any;
  setFieldValue: (key: any, value: any) => void;
}

const MPSetCategoryCerticates = ({
  restField,
  category,
  form,
  name,
  categoryValue,
  setFieldValue,
}: IProps) => {
  const key = [name, "certicates"];

  if (!category || category.sensitive_type === 0) return <div />;

  return (
    <Form.Item {...restField}>
      <UploadAvatar
        files={categoryValue?.certicates || []}
        onChange={(e) => {
          setFieldValue(key, e);
          setFieldValue([name, "qualify"], category.biz_qualify);
        }}
        maxCount={5}
      />
      <Text type="secondary">需要资质：{category.biz_qualify.remark}</Text>
    </Form.Item>
  );
};

export default MPSetCategoryCerticates;
