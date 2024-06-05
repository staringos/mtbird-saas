import { Content } from "antd/lib/layout/layout";
import React, { useEffect, useState } from "react";
import ManagerSider from "../../components/ManagerSider";
import IndexLayout from "..";
import styles from "./style.module.less";

interface IProps {
  children: any;
  type: string;
}

const DeveloperLayout = ({ children, type }: IProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <IndexLayout>
      {isClient && <ManagerSider type={type} />}
      <Content className={styles.container}>
        <Content className={styles.content}>{children}</Content>
      </Content>
    </IndexLayout>
  );
};

export default DeveloperLayout;
