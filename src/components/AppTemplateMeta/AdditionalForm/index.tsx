import React, { PropsWithChildren } from "react";
import Link from "next/link";

import styles from "./index.module.less";

import { IExtraConfigFormType } from "../../../types/entities/Application";

type Props = { type: IExtraConfigFormType, formKey: string };

const Additional = ({ type, children, formKey }: PropsWithChildren<Props>) => {
  if (formKey === "token") {
    return (
      <div className={styles.inputWrapper}>
				{children}
        <a href="https://staringos.feishu.cn/wiki/Z4NmwIXkEi5Q5lk3706cFyvFnHe"  target="_blank" rel="noreferrer">如何获取 Token</a>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default Additional;
