import React from "react";
import type { NextPage } from "next";
import { Divider, Typography } from "antd";
import { observer } from "mobx-react-lite";
import ManagerLayout from "../../../layout/ManagerLayout";
import Center from "../../../components/Center";
import styles from "./style.module.less";

const { Title, Paragraph, Link } = Typography;

const APIsPage: NextPage = observer(() => {
  return (
    <ManagerLayout type="dataCenter">
      <Title level={2}>自有接口（API）</Title>
      <Paragraph>
        自有接口（API） 相关文档，请参考
        <Link
          target="_blank"
          href="https://docs.staringos.com/?path=/docs/数据中心-介绍--page&f=CMTAPIsPage"
        >
          文档
        </Link>
      </Paragraph>
      <Divider />
      <div className={styles.dataTablesWrapper}>
        <Center>自有接口（APIs）功能开发中，敬请期待！</Center>
      </div>
    </ManagerLayout>
  );
});

export default APIsPage;
