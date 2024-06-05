import { Content } from "antd/lib/layout/layout";
import React from "react";
import AppSider from "../../components/AppSider";
import IndexLayout from "..";
import styles from "./style.module.less";
import AppBar from "../../components/AppBar";
import { useStore } from "store";
import NoApp from "../../components/NoApp";
import { observer } from "mobx-react-lite";
import Head from "next/head";

interface IProps {
  children: any;
}

const AppLayout = observer(({ children }: IProps) => {
  const { currentApp } = useStore();
  return (
    <IndexLayout>
      <AppSider />
      {currentApp && (
        <Content className={styles.container}>
          <AppBar />
          <Content className={styles.content}>{children}</Content>
        </Content>
      )}
      {!currentApp && (
        <Content className={styles.container}>
          <Content className={styles.content}>
            <NoApp />
          </Content>
        </Content>
      )}
    </IndexLayout>
  );
});

export default AppLayout;
