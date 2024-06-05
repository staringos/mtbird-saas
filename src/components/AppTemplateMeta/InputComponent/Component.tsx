import React from "react";
import { Input as InputComp } from "antd";

import styles from "./index.module.less";

type Props = {
  value?: string;
  onChange?: (value: any) => void;
  label?: string;
};

const Input = (props: Props) => {
  return (
    <div className={styles.inputWrap}>
      <InputComp
        value={props.value}
        onChange={props.onChange}
        className={styles.input}
      />
    </div>
  );
};

export default Input;
