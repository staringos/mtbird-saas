import React from "react";
import { Button } from "antd";
import { UserAddOutlined, ToTopOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { MODAL_NAME } from "modals/TemplateMarketplaceModal";
import styles from "./style.module.less";
import PageSearchBar from "../../PageSearchBar";

const PageListHeader = observer(() => {
  const { openModal } = useStore();
  const handleAdd = () => {
    openModal(MODAL_NAME);
  };

  return (
    <div className={styles.pageListHeaderContainer}>
      <PageSearchBar />
      <div>
        <Button
          id="createPageBtn"
          icon={<UserAddOutlined />}
          onClick={handleAdd}
        >
          新建页面
        </Button>
      </div>
    </div>
  );
});

export default PageListHeader;
