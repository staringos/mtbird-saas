import React, { useEffect, useState } from "react";
import { Divider, Layout, Menu } from "antd";
import styles from "./styles.module.less";
import type { MenuProps } from "antd";
import {
  AppstoreAddOutlined,
  UpCircleOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import AppMenu from "../AppMenu";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { MODAL_NAME } from "modals/AddTeamModal";
import { MODAL_NAME as APP_MODAL_NAME } from "modals/AddAppModal";
import { useRouter } from "next/router";

const { Sider } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

const AppSider = observer(() => {
  const [isSSR, setIsSSR] = useState(true);
  const { openModal, currentApp } = useStore();
  const router = useRouter();

  useEffect(() => {
    setIsSSR(false);
  }, []);

  const handleClick = (e: any) => {
    switch (e.key) {
      case "addTeam":
        openModal(MODAL_NAME);
        break;
      case "addApp":
        openModal(APP_MODAL_NAME);
        break;
      case "goUp":
        router.push("/team/upgrade");
        break;
    }
  };

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group"
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  const features: MenuProps["items"] = [
    getItem("增加团队", "addTeam", <UserAddOutlined />),
    getItem("增加应用", "addApp", <AppstoreAddOutlined />),
    getItem("立即升级", "goUp", <UpCircleOutlined />),
  ];

  return (
    <Sider className={styles.sider}>
      <Menu
        onClick={handleClick}
        selectedKeys={[]}
        // defaultSelectedKeys={['1']}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={features}
      />
      <Divider />
      {!isSSR && currentApp && <AppMenu />}
    </Sider>
  );
});

export default AppSider;
