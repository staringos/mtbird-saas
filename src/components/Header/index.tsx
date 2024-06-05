import React, { useEffect } from "react";
import { Layout, Menu } from "antd";
import styles from "./styles.module.less";
import Avatar from "./Avatar";
import TeamSelect from "./TeamSelect";
import AddTeamModal, {
  MODAL_NAME as ADD_TEAM_MODAL_NAME,
} from "modals/AddTeamModal";
import AddAppModal, {
  MODAL_NAME as ADD_APP_MODAL_NAME,
} from "modals/AddAppModal";
import AddPageModal, {
  MODAL_NAME as ADD_PAGE_MODAL_NAME,
} from "modals/AddPageModal";
import CopyPageModal, {
  MODAL_NAME as COPY_PAGE_MODAL_NAME,
} from "modals/CopyPageModal";
import TemplateMarketplaceModal, {
  MODAL_NAME as TEMPLATE_MODAL_NAME,
} from "modals/TemplateMarketplaceModal";
import BindDomainModal, {
  MODAL_NAME as BIND_DOMAIN_MODAL_NAME,
} from "modals/BindDomainModal";
import keys from "lodash/keys";
import UpdatePasswordModal, {
  MODAL_NAME as PASSWORD_MODAL_NAME,
} from "modals/UpdatePasswordModal";
import UserProfileModal, {
  MODAL_NAME as USER_PROFILE_MODAL_NAME,
} from "modals/UserProfileModal";
import InviteMemberModal, {
  MODAL_NAME as INVITE_MEMBER_MODAL_NAME,
} from "../../modals/InviteMemberModal";
import EditPageModal, {
  MODAL_NAME as EDIT_PAGE_MODAL_NAME,
} from "../../modals/EditPageModal";
import AddDataModelModal, {
  MODAL_NAME as ADD_DATA_MODEL_MODAL_NAME,
} from "../../modals/AddDataModelModal";
import AddDataModelFieldModal, {
  MODAL_NAME as ADD_DATA_MODEL_FIELD_MODAL_NAME,
} from "../../modals/AddModelFieldModal";
import PublishMPModal, {
  MODAL_NAME as PUBLISH_MP_MODAL_NAME,
} from "../../modals/PublishMPModal";
import MPVerifyModal, {
  MODAL_NAME as MP_VERIFY_MODEL_MODAL,
} from "../../modals/MPVerifyModal";
import MPAuditModal, {
  MODAL_NAME as MP_AUDIT_MODEL_MODAL,
} from "../../modals/MPAuditModal";
import CustomerServiceModal, {
  MODAL_NAME as CUSTOMER_SERVICE_MODAL,
} from "../../modals/CustomerServiceModal";
import PhoneBindModal, {
  MODAL_NAME as PHONE_BIND_MODAL,
} from "../../modals/PhoneBindModal";

import Router from "next/router";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import TeamVersionBadge from "../TeamVersionBadge";

const Header = observer(() => {
  const { modals, initModals, currentTeamId } = useStore();
  const pn = Router.pathname;
  const selectedKeys = [
    pn.indexOf("developer") !== -1
      ? "/developer/getToken"
      : pn.indexOf("team") !== -1
      ? "/team/members"
      : pn.indexOf("dataCenter") !== -1
      ? "/dataCenter/dataTable"
      : pn.indexOf("platform") !== -1
      ? "/platform/order"
      : "/",
  ];
  const handleMenuChangeClick = (e: any) => {
    Router.push(e.key);
  };

  const MODALS = {
    [PASSWORD_MODAL_NAME]: <UpdatePasswordModal />,
    [USER_PROFILE_MODAL_NAME]: <UserProfileModal />,
    [INVITE_MEMBER_MODAL_NAME]: <InviteMemberModal />,
    [ADD_TEAM_MODAL_NAME]: <AddTeamModal />,
    [ADD_APP_MODAL_NAME]: <AddAppModal />,
    [ADD_PAGE_MODAL_NAME]: <AddPageModal />,
    [COPY_PAGE_MODAL_NAME]: <CopyPageModal />,
    [TEMPLATE_MODAL_NAME]: <TemplateMarketplaceModal />,
    [BIND_DOMAIN_MODAL_NAME]: <BindDomainModal />,
    [EDIT_PAGE_MODAL_NAME]: <EditPageModal />,
    [ADD_DATA_MODEL_MODAL_NAME]: <AddDataModelModal />,
    [ADD_DATA_MODEL_FIELD_MODAL_NAME]: <AddDataModelFieldModal />,
    [PUBLISH_MP_MODAL_NAME]: <PublishMPModal />,
    [MP_VERIFY_MODEL_MODAL]: <MPVerifyModal />,
    [MP_AUDIT_MODEL_MODAL]: <MPAuditModal />,
    [CUSTOMER_SERVICE_MODAL]: <CustomerServiceModal />,
    [PHONE_BIND_MODAL]: <PhoneBindModal />,
  };

  useEffect(() => {
    initModals(MODALS);
  }, []);

  const menuItems = [
    { label: "小星AI", key: "https://staringai.com" },
    { label: "我的应用", key: "/" },
    { label: "数据中心", key: "/dataCenter/dataTable" },
    { label: "开发者中心", key: "/developer/getToken" },
    { label: "团队管理", key: "/team/members" },
  ] as any;

  if (currentTeamId === process.env.NEXT_PUBLIC_ADMIN_TEAM) {
    menuItems.push({ label: "平台管理", key: "/platform/order" });
  }

  return (
    <Layout.Header className={styles.header}>
      <div
        className={styles.logoContainer}
        onClick={() => (location.href = "/")}
      >
        <div
          className={styles.logo}
          style={{ backgroundImage: "url(/statics/logo.png)" }}
        />
      </div>
      <TeamSelect />
      <TeamVersionBadge />
      {/* <AppSelect /> */}
      <Menu
        className={styles.headerMenu}
        mode="horizontal"
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={handleMenuChangeClick}
      />
      <Avatar />

      {keys(MODALS).map((key) => {
        return modals[key] && (MODALS as any)[key];
      })}
    </Layout.Header>
  );
});

export default Header;
