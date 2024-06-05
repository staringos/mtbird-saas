import React, { useState } from "react";
import AppLayout from "layout/AppLayout";
import { Divider, Typography, Form, Button, Modal, message } from "antd";
import { useStore } from "store";
import DomainDisplay from "../../components/DomainDisplay";
import { MODAL_NAME } from "modals/BindDomainModal";
import { observer } from "mobx-react-lite";
import { Input } from "antd";
import { isStringEmpty } from "utils";
import AppDetailsEditor from "../../components/AppDetailsEditor";

const { Title, Paragraph, Link } = Typography;

const SettingsPage = observer(() => {
  const { currentApp, openModal, currentAppId, deleteApp, refreshCurrentApp } =
    useStore();
  const [deleteAppName, setDeleteName] = useState("");
  const [openDelete, setOpenDelete] = useState(false);

  const handleBindDomain = () => {
    openModal(MODAL_NAME);
  };

  const handleDeleteApp = async () => {
    if (isStringEmpty(deleteAppName) || deleteAppName !== currentApp.name) {
      message.error("请输入正确的应用名!");
      return false;
    }

    await deleteApp(currentApp.id);
    handleCancel();
    return true;
  };

  const handleToDeleteApp = () => {
    setOpenDelete(true);
  };

  const handleCancel = () => {
    setOpenDelete(false);
    setDeleteName("");
  };

  return (
    <AppLayout>
      <Title level={2}>应用设置</Title>
      <Paragraph>
        应用设置包括设置应用的基本信息和访问模式
        <Link
          target="_blank"
          href="https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E7%BB%91%E5%AE%9A%E5%9F%9F%E5%90%8D--page&f=CMTSettingsPage"
        >
          文档
        </Link>
      </Paragraph>
      <Divider />
      <AppDetailsEditor currentApp={currentApp} onChange={refreshCurrentApp} />
      <Form.Item label="小程序类目">
        <span>{currentApp?.desc}</span>
      </Form.Item>
      <Divider />
      <Form.Item
        label="绑定域名"
        extra={
          <span>
            请设置您的域名DNS解析类型为
            cname，解析值为上述链接，详细操作步骤，可以参考
            <a
              href="https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E7%BB%91%E5%AE%9A%E5%9F%9F%E5%90%8D--page"
              rel="noreferrer"
              target="_blank"
              style={{ textDecoration: "underline" }}
            >
              这个文档
            </a>
          </span>
        }
      >
        {currentApp && currentApp?.domain ? (
          <DomainDisplay
            onChange={handleBindDomain}
            currentAppId={currentAppId}
            domain={currentApp?.domain}
          />
        ) : (
          <Button onClick={handleBindDomain}>绑定域名</Button>
        )}
      </Form.Item>
      <Divider />
      <Form.Item
        label="删除应用"
        extra="删除应用时会同步删除应用下所有页面，请谨慎操作"
        colon={false}
      >
        <Button type="primary" danger onClick={handleToDeleteApp}>
          删除应用
        </Button>
      </Form.Item>
      <Modal
        open={openDelete}
        title="删除应用"
        onOk={handleDeleteApp}
        onCancel={handleCancel}
      >
        <p>
          确定要删除应用吗？请输入要删除的应用名，删除无法恢复，请谨慎操作！
        </p>
        <Form.Item label="应用名" colon={false}>
          <Input
            placeholder={currentApp?.name}
            value={deleteAppName}
            onChange={(e) => setDeleteName(e.target.value)}
          />
        </Form.Item>
      </Modal>
    </AppLayout>
  );
});

export default SettingsPage;
