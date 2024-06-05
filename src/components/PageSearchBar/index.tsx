import React, { useContext } from "react";
import Input from "components/UI/Input";
import Select from "components/UI/Select";
import styles from "./style.module.less";
import { useStore } from "store";
import { observer } from "mobx-react-lite";

const PageSearchBar = observer(() => {
  return (
    <div className={styles.pageSearchBar}>
      <Input
        placeholder="输入页面名称搜索"
        style={{ maxWidth: "200px", marginLeft: "10px" }}
      />
    </div>
  );
});

export default PageSearchBar;
