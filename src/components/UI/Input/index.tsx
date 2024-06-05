import React from "react";
import { Input } from "antd";
import styles from "./style.module.less";

const InputComponent = (props) => {
  return <Input className={styles.inputComponent} {...props} />;
};

export default InputComponent;
