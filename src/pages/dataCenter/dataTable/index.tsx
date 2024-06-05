import React, { useState } from "react";
import type { NextPage } from "next";
import { Divider, Typography, Tabs } from "antd";
import { observer } from "mobx-react-lite";
import ManagerLayout from "../../../layout/ManagerLayout";
import DataTableModals from "../../../components/DataTable/DataModels";
import DataTableList from "../../../components/DataTable/DataTableList";
import DataModelFields from "../../../components/DataTable/DataModelFields";
import styles from "./style.module.less";

const { Title, Paragraph, Link } = Typography;

const DataTablePage: NextPage = observer(() => {
  const [currentModelId, setCurrentModelId] = useState<string | undefined>();
  const [currentTab, setCurrentTab] = useState<string>("data");

  const handleTabChange = (e: string) => {
    setCurrentTab(e);
  };

  const handleModelChange = (e: string) => {
    setCurrentModelId(e);
  };

  const items = [
    {
      label: "数据",
      key: "data",
      children: currentModelId ? (
        <DataTableList modelId={currentModelId} />
      ) : (
        ""
      ),
    },
    {
      label: "字段结构",
      key: "field",
      children: <DataModelFields modelId={currentModelId} />,
    },
  ];

  return (
    <ManagerLayout type="dataCenter">
      <Title level={2}>数据表</Title>
      <Paragraph>
        数据表相关文档，请参考
        <Link
          target="_blank"
          href="https://docs.staringos.com/?path=/docs/%E6%8B%93%E5%B1%95-%E5%8F%91%E5%B8%83--page&f=CMTDataTablePage"
        >
          文档
        </Link>
      </Paragraph>
      <Divider />
      <div className={styles.dataTablesWrapper}>
        <DataTableModals
          modelId={currentModelId}
          onModelChange={handleModelChange}
        />
        <Tabs
          activeKey={currentTab}
          className={styles.dataTableTab}
          onChange={handleTabChange}
          type="card"
          destroyInactiveTabPane={true}
          items={items}
        />
      </div>
    </ManagerLayout>
  );
});

export default DataTablePage;
