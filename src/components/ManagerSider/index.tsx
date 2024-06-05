import React from "react";
import { Layout, Menu } from "antd";
import styles from "./style.module.less";
import type { MenuProps } from "antd";
import {
  SettingOutlined,
  UserAddOutlined,
  DatabaseOutlined,
  ApiOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import Router from "next/router";
import { getItem } from "../../utils";

const { Sider } = Layout;

interface IProps {
  type: string;
}

const MENUS = {
  developer: [
    getItem("获取Token", "getToken", <SettingOutlined />),
    getItem("团队拓展", "extensions", <UserAddOutlined />),
  ],
  team: [
    getItem("团队信息", "basic", <SettingOutlined />),
    getItem("团队成员", "members", <SettingOutlined />),
    getItem("升级团队", "upgrade", <UpCircleOutlined />),
  ],
  dataCenter: [
    getItem("数据表", "dataTable", <DatabaseOutlined />),
    getItem("APIs", "apis", <ApiOutlined />),
  ],
  platform: [
    getItem("订单管理", "order", <SettingOutlined />),
    getItem("模版管理", "template", <UpCircleOutlined />),
    getItem("用户管理", "user", <SettingOutlined />),
    getItem("页面管理", "page", <UpCircleOutlined />),
    getItem("应用管理", "app", <UpCircleOutlined />),
    getItem("团队管理", "team", <UpCircleOutlined />),
  ],
};

const ManagerSider = observer(({ type }: IProps) => {
  const selectedKeys = [Router.pathname.split("/")[2]];
  const handleClick = (e: any) => {
    Router.push(`/${type}/${e.key}`);
  };

  const features: MenuProps["items"] = (MENUS as any)[type];

  return (
    <Sider className={styles.sider}>
      <Menu
        onClick={handleClick}
        selectedKeys={selectedKeys}
        mode="inline"
        items={features}
      />
    </Sider>
  );
});

export default ManagerSider;
