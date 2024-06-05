import React from "react";
import styles from "./style.module.less";
import { Tag } from "antd";
import { UpCircleOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { useRouter } from "next/router";

const TEAM_VERSION = {
  normal: {
    badge: "🪙",
    name: "免费版",
    color: "gray",
  },
  professional: {
    badge: "🧑‍🚀",
    name: "专业版",
    color: "cyan",
  },
  enterprise: {
    badge: "👑",
    name: "企业版",
    color: "green",
  },
  private: {
    badge: "🏦",
    name: "内部版",
    color: "purple",
  },
};

const TeamVersionBadge = observer(() => {
  const { currentTeam } = useStore();
  const curVersion = TEAM_VERSION[currentTeam?.version || "normal"];
  const router = useRouter();

  const handleClick = () => {
    router.push("/team/upgrade");
  };

  return (
    <div className={styles.badgeContainer} onClick={handleClick}>
      <Tag color="default">
        <span>{curVersion.badge}</span>
        <span className={styles.badgeTitle} color={curVersion.color}>
          {curVersion.name}
        </span>
      </Tag>
      {/* <Button size="small" type="primary" icon={<UpCircleOutlined />}>升级</Button> */}
    </div>
  );
});

export default TeamVersionBadge;
