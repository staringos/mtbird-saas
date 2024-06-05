import React from "react";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { useStore } from "store";

interface IProps {
  value: string;
  onChange: (e: string) => void;
}

const PageSelect = observer(({ value, onChange }: IProps) => {
  const { pages } = useStore();
  return (
    <Select onChange={onChange} value={value} placeholder="请选择页面">
      {pages.map((cur) => {
        return (
          <Select.Option value={cur.id} key={cur.id}>
            {cur.title}
          </Select.Option>
        );
      })}
    </Select>
  );
});

export default PageSelect;
