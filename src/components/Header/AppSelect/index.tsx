import React from "react";
import { Select, Button } from "antd";
import styles from "./style.module.less";
import { PlusOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { IApplication } from "types/entities/Application";

const { Option } = Select;

const AppSelect = observer(() => {
  const { applications, currentAppId, setCurrentApp } = useStore();

  const handleChange = (cur: any) => {
    console.log("cur:", cur);
    setCurrentApp(cur);
  };

  return (
    <div className={styles.selectContainer}>
      <Select
        className={styles.select}
        value={currentAppId}
        onChange={handleChange}
      >
        {applications &&
          applications.map((cur: IApplication) => (
            <Option value={cur.id} key={cur.id}>
              {cur.name}
            </Option>
          ))}
      </Select>
      <Button
        shape="circle"
        size="small"
        title="增加应用"
        icon={<PlusOutlined />}
      />
    </div>
  );
});

export default AppSelect;
