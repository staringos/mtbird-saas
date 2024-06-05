import React from "react";
import { Button, message, Tabs, Dropdown } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { ToTopOutlined } from "@ant-design/icons";
import styles from "./style.module.less";
import { useRouter } from "next/router";
import AppPublish from "../AppPublish";

const AppBar = observer(() => {
  const { setCurrentApp, getHomePage } = useStore();
  const router = useRouter();

  const handleTabChange = (e: any) => {
    router.push(e);
  };
  const handleAppChange = (id: string) => {
    setCurrentApp(id);
  };

  const handleToHomePage = () => {
    const homePage = getHomePage();
    if (!homePage)
      return message.error(
        "该应用还未设置首页，请点击页面右侧 ... -> 设为首页 设置！"
      );
    window.open(`/preview/${homePage.id}`);
  };

  const handlePublish = () => {};

  return (
    <div className={styles.appBarWrapper}>
      <div className={styles.appBarContainer}>
        <div className={styles.appBarLeft}>
          <Tabs onChange={handleTabChange} activeKey={router.pathname}>
            <Tabs.TabPane tab="总览" key="/app/overview"></Tabs.TabPane>
            <Tabs.TabPane tab="页面列表" key="/"></Tabs.TabPane>
            <Tabs.TabPane tab="表单数据" key="/app/forms"></Tabs.TabPane>
            <Tabs.TabPane tab="设置" key="/app/settings"></Tabs.TabPane>
          </Tabs>
          {/* <Select value={currentAppId} style={{ width: 200 }} onChange={handleAppChange}>
            {applications.map(cur => {
              return (
                <Select.Option value={cur.id} key={cur.id}>{cur.name}</Select.Option>
              )
            })}
          </Select> */}
          {/* <Tag color="success">已发布</Tag>
          <Tag color="default">未发布</Tag> */}
        </div>
        <Button type="default" onClick={handleToHomePage}>
          进入首页
        </Button>
        <Dropdown overlay={<AppPublish />} trigger={["click"]}>
          <Button
            icon={<ToTopOutlined />}
            onClick={handlePublish}
            type="primary"
            style={{ marginLeft: "10px" }}
            id="publishBtn"
          >
            发布应用
          </Button>
        </Dropdown>
      </div>
    </div>
  );
});

export default AppBar;
