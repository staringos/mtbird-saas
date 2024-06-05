import React from "react";
import { Dropdown, Menu, Space } from "antd";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { MODAL_NAME as USER_PROFILE_MODAL_NAME } from "../../modals/UserProfileModal";
import { MODAL_NAME as PASSWORD_MODAL_NAME } from "../../modals/UpdatePasswordModal";
import { MODAL_NAME as PHONE_BIND_MODAL } from "../../modals/PhoneBindModal";

import AvatarWithName from "./AvatarWithName";

const AvatarComponent = observer(() => {
  const { userInfo, logout, openModal } = useStore();
  const menuItems = [
    {
      key: 1,
      label: (
        <a
          rel="noopener noreferrer"
          href="javascript: void(0);"
          onClick={() => openModal(USER_PROFILE_MODAL_NAME)}
        >
          个人信息
        </a>
      ),
    },
    {
      key: 4,
      label: (
        <a
          rel="noopener noreferrer"
          href="javascript: void(0);"
          onClick={() => openModal(PHONE_BIND_MODAL)}
        >
          绑定手机号
        </a>
      ),
    },
    {
      key: 2,
      label: (
        <a
          rel="noopener noreferrer"
          href="javascript: void(0);"
          onClick={() => openModal(PASSWORD_MODAL_NAME)}
        >
          修改密码
        </a>
      ),
    },
    {
      key: 3,
      label: (
        <a
          rel="noopener noreferrer"
          href="javascript: void(0);"
          onClick={logout}
        >
          退出
        </a>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomLeft">
      <div>
        <AvatarWithName name={userInfo?.nickname} avatar={userInfo?.avatar} />
      </div>
    </Dropdown>
  );
});

export default AvatarComponent;
