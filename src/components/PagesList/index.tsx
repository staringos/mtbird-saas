import React from "react";
import { Divider } from "antd";
import type { IPageConfig } from "@mtbird/shared";
import PageListHeader from "./PageListHeader";
import styles from "./style.module.less";
import PageListContent from "./PageListContent";

const PageListComponent = () => {
  return (
    <div className={styles.pageListContainer}>
      <PageListHeader />
      <PageListContent />
    </div>
  );
};

export default PageListComponent;
