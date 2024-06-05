import React, { FormEvent, useEffect, useState } from "react";
import { Button, Menu, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./style.module.less";
import { getDataModels } from "apis/dataCenter";
import { useStore } from "../../../store";
import { MODAL_NAME as APP_DATA_MODEL_MODAL_NAME } from "modals/AddDataModelModal";

const { Title } = Typography;

interface IProps {
  modelId: string | undefined;
  onModelChange: (modelId: string) => void;
}

const DataTableModels = ({ modelId, onModelChange }: IProps) => {
  const { currentTeamId, openModal } = useStore();
  const [models, setModels] = useState([]);

  const handleMenuChange = (e: any) => {
    onModelChange(e.key);
  };

  const refresh = async () => {
    if (!currentTeamId) return;
    const res = await getDataModels(currentTeamId);
    const menus = res.data.map((cur: any) => ({
      label: cur.name,
      key: cur.id,
      type: "label",
    }));

    setModels(menus);
    if (!modelId) onModelChange(menus[0]?.key || undefined);
  };

  const handleToAddDataModelClick = () => {
    openModal(APP_DATA_MODEL_MODAL_NAME, {
      afterClose: () => refresh(),
    });
  };

  useEffect(() => {
    refresh();
  }, [currentTeamId]);

  const selectedKeys = modelId ? [modelId] : [];

  return (
    <div className={styles.dataTableModalsWrapper}>
      <div className={styles.dataTableHeader}>
        <div className={styles.dataTableTitle}>数据模型</div>
        <Button type="link" onClick={handleToAddDataModelClick}>
          <PlusOutlined />
        </Button>
      </div>
      <div className={styles.dataTableModals}>
        <Menu
          selectedKeys={selectedKeys}
          onClick={handleMenuChange}
          style={{ width: 256 }}
          mode="vertical"
          items={models}
        />
      </div>
    </div>
  );
};

export default DataTableModels;
