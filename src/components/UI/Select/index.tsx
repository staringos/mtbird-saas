import React from "react";
import { Select } from "antd";
import styles from "./style.module.less";

const SelectComponent = (props) => {
  return <Select className={styles.selectComponent} {...props} />;
};

SelectComponent.Option = Select.Option;

export default SelectComponent;
