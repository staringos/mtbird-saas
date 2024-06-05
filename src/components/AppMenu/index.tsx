import React, { useMemo } from "react";
import { Menu } from "antd";
import { AppstoreOutlined, AreaChartOutlined } from "@ant-design/icons";
import { useStore } from "store";
import styles from "./style.module.less";
import { observer } from "mobx-react-lite";

const AppMenu = observer(() => {
  const { applications, currentAppId, setCurrentApp } = useStore();

  const manus = useMemo(
    () => [
      {
        key: "apps",
        icon: <AppstoreOutlined className={styles.appMenuIcon} />,
        label: "我的应用",
        children: applications
          ? applications.map((cur) => {
              return {
                key: cur.id,
                icon: <AreaChartOutlined className={styles.appMenuIcon} />,
                label: cur.name,
              };
            })
          : [],
      },
    ],
    [applications]
  );

  const handleClick = (e: any) => {
    if (e.key === "apps") return;
    setCurrentApp(e.key);
  };

  return (
    <Menu
      className={styles.appMenu}
      selectedKeys={[currentAppId!]}
      defaultOpenKeys={["apps"]}
      onClick={handleClick}
      mode="inline"
      items={manus}
    />
  );
});

export default AppMenu;
