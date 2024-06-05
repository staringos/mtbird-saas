import React, { useEffect, useState } from "react";
import { Form, Button, Input } from "antd";

export interface IOptionItem {
  label: string;
  value: string;
  index?: number;
}

interface IProps {
  data?: IOptionItem | undefined;
  onSubmit: (val: IOptionItem) => void;
  onCancel: () => void;
}

const DataModelFieldOption = ({ data, onSubmit, onCancel }: IProps) => {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!data) {
      setLabel("");
      setValue("");
    } else {
      setLabel(data.label);
      setValue(data.value);
    }
  }, [data]);

  const handleSubmit = () => {
    if (!label) return;
    if (!value) return;
    onSubmit({ label, value });
  };

  const handleLabelChange = (e: any) => {
    setLabel(e.target.value);
  };

  const handleValueChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <Form.Item label="显示名">
          <Input
            placeholder="请输入显示名"
            value={label}
            onChange={handleLabelChange}
          />
        </Form.Item>
        &nbsp; &nbsp;
        <Form.Item label="实际值">
          <Input
            placeholder="请输入实际值"
            value={value}
            onChange={handleValueChange}
          />
        </Form.Item>
      </div>
      <Form.Item>
        <Button onClick={handleSubmit} type="link">
          提交
        </Button>
        <Button onClick={onCancel} type="link">
          取消
        </Button>
      </Form.Item>
    </div>
  );
};
export default DataModelFieldOption;
