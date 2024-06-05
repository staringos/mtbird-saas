import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import React from "react";
import styles from "./style.module.less";

interface IProps {
  name: string | undefined;
  avatar: string | undefined;
  onClick?: () => void;
}

const AvatarWithName = ({ name, avatar, onClick }: IProps) => {
  const handleClick = (e: any) => {
    e.preventDefault();
    onClick && onClick();
  };

  return (
    <div className={styles.avatarContainer} onClick={handleClick}>
      <Avatar size="small" icon={<UserOutlined />} src={avatar} />
      <h3 className={styles.usernameArea}>{name}</h3>
    </div>
  );
};

export default AvatarWithName;
