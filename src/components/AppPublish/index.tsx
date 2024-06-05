import React, { useEffect } from "react";
import {
  Form,
  Button,
  Tooltip,
  Spin,
  message,
  Typography,
  Divider,
  Alert,
  Collapse,
  Space,
} from "antd";
import { observer } from "mobx-react-lite";
import styles from "./style.module.less";
import {
  CheckCircleTwoTone,
  WarningTwoTone,
  ReloadOutlined,
  Loading3QuartersOutlined,
  VerifiedOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useStore } from "store";
import { MODAL_NAME as PUBLISH_MP_MODAL_NAME } from "../../modals/PublishMPModal";
import { MODAL_NAME as MP_VERIFY_MODEL_MODAL } from "../../modals/MPVerifyModal";
import { MODAL_NAME as MP_AUDIT_MODEL_MODAL } from "../../modals/MPAuditModal";
import {
  refreshMpAuditStatus,
  refreshOfficalQrcode,
  setDomain,
  commitCode,
  setApiDomain,
} from "apis/wx";

import ShareDropdown from "../ShareDropdown";

const { Title } = Typography;

const AppPublish = observer(() => {
  const {
    currentAppId,
    openModal,
    pages,
    currentApp,
    initWxMp,
    mp,
    loadingMp,
  } = useStore();

  const handlePublishMiniProgram = () => {
    openModal(PUBLISH_MP_MODAL_NAME);
  };

  const handleToBind = () => {
    location.href = "/app/settings";
  };

  const targetPage = currentApp?.homePageId
    ? pages.find((cur) => cur.id === currentApp.homePageId)
    : pages[0];

  useEffect(() => {
    initWxMp();
  }, [currentAppId]);

  if (
    pages.length === 0 ||
    pages.find((cur) => !(cur as any).publishedHistoryId && !cur.isNativePage)
  ) {
    return (
      <Alert
        message="请创建页面并发布全部页面后，发布应用"
        type="warning"
        showIcon
        closable
      />
    );
  }

  const handleToVerify = () => {
    openModal(MP_VERIFY_MODEL_MODAL);
  };

  const handleToAudit = () => {
    openModal(MP_AUDIT_MODEL_MODAL);
  };

  const handleRefreshAudit = async () => {
    await refreshMpAuditStatus(currentAppId!);
    message.success("审核状态更新成功!");
    initWxMp();
  };

  const handleRefreshQrcode = async () => {
    await refreshOfficalQrcode(currentAppId!);
    message.success("操作成功!");
    initWxMp();
  };

  const handleSetDomain = async () => {
    await setDomain(currentAppId!);
    message.success("操作成功!");
  };

  const handleSetApiDomain = async () => {
    await setApiDomain(currentAppId!);
    message.success("操作成功!");
  };

  const handleCommitCode = async () => {
    await commitCode(currentAppId!);
    message.success("操作成功!");
  };

  return (
    <Spin spinning={loadingMp}>
      <div className={styles.appPublishContainer}>
        <Title level={5}>网页应用</Title>
        <Form.Item
          label={<label className={styles.formLabel}>网页状态</label>}
          style={{ marginBottom: 0 }}
          colon={false}
        >
          <div>
            <CheckCircleTwoTone twoToneColor="#52c41a" /> 已发布
          </div>
        </Form.Item>
        <Form.Item
          label={<label className={styles.formLabel}>操作</label>}
          style={{ marginBottom: 0 }}
          colon={false}
        >
          <div>
            <Button type="link" size="small" onClick={handleToBind}>
              绑定域名
            </Button>
            {targetPage && (
              <ShareDropdown page={targetPage as any}>
                <Button type="link" size="small">
                  分享
                </Button>
              </ShareDropdown>
            )}
          </div>
        </Form.Item>
        <br />
        <Divider />
        <Title level={5}>小程序</Title>
        {!mp || !mp.qrcodeUrl ? (
          <Button onClick={handlePublishMiniProgram}>发布试用小程序</Button>
        ) : (
          <div className={styles.registeredMP}>
            {mp.type === "beta" && (
              <Alert
                message="试用小程序有效期仅有十五天，请尽快完成小程序认证！"
                type="warning"
                showIcon
                closable
              />
            )}
            {mp.status === "audited" && (
              <Form.Item
                label={<label className={styles.formLabel}>正式版</label>}
                style={{ marginBottom: 0 }}
                colon={false}
              >
                <img
                  className={styles.qrcode}
                  style={{ width: 150 }}
                  src={mp.officalQrcodeUrl}
                />
                <br />
                <div style={{ textAlign: "center" }}>
                  <a href="javascript:void(0);" onClick={handleRefreshQrcode}>
                    更新
                  </a>{" "}
                  ｜
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={mp.officalQrcodeUrl}
                  >
                    下载
                  </a>
                </div>
              </Form.Item>
            )}
            <Form.Item
              label={<label className={styles.formLabel}>体验版</label>}
              style={{ marginBottom: 0 }}
              colon={false}
            >
              <img
                className={styles.qrcode}
                style={{ width: 150 }}
                src={mp.qrcodeUrl}
              />
            </Form.Item>
            <Form.Item
              label={<label className={styles.formLabel}>类型</label>}
              style={{ marginBottom: 0 }}
              colon={false}
            >
              {mp.type === "beta" && (
                <Tooltip
                  placement="topLeft"
                  title="试用小程序有效期仅有十五天，请尽快完成小程序认证！"
                >
                  <span>
                    <WarningTwoTone twoToneColor="#eb2f96" /> 试用小程序
                  </span>
                </Tooltip>
              )}
              {mp.type === "release" && (
                <Tooltip placement="topLeft" title="小程序已完成认证">
                  <span>
                    <CheckCircleTwoTone twoToneColor="#52c41a" /> 正式小程序
                  </span>
                </Tooltip>
              )}
            </Form.Item>
            {mp.type === "release" && (
              <Form.Item
                label={<label className={styles.formLabel}>微信</label>}
              >
                <Space direction="vertical">
                  <a href="https://developers.weixin.qq.com/community/minihome/doc/000c4c6ffb43f809859a0da4456001?blockType=99">
                    <QuestionCircleOutlined twoToneColor="#52c41a" />{" "}
                    如何登录微信小程序后台？
                  </a>
                  <Button target="_blank" href="https://mp.weixin.qq.com">
                    去微信小程序后台
                  </Button>
                </Space>
              </Form.Item>
            )}
            <Form.Item
              label={<label className={styles.formLabel}>审核状态</label>}
              style={{ marginBottom: 10 }}
              colon={false}
            >
              {mp.status !== "auditing" && mp.status !== "audited" && (
                <Tooltip
                  placement="topLeft"
                  title="小程序未提交审核, 如需上线请提交审核"
                >
                  <span>
                    <WarningOutlined style={{ color: "#b0b000" }} /> 未提交审核
                  </span>
                </Tooltip>
              )}
              {(mp.status === "auditing" || mp.auditStatus !== "0") && (
                <Tooltip placement="topLeft" title="小程序审核中">
                  <span>
                    <Loading3QuartersOutlined /> 审核中
                  </span>
                </Tooltip>
              )}
              {mp.status === "audited" && mp.auditStatus === "0" && (
                <Tooltip placement="topLeft" title="小程序审核通过, 已自动上线">
                  <span>
                    <VerifiedOutlined style={{ color: "#52c41a" }} /> 审核通过
                  </span>
                </Tooltip>
              )}
            </Form.Item>

            <Space>
              {mp.status === "auditing" && mp.auditStatus !== "0" && (
                <Button onClick={handleRefreshAudit}>刷新审核状态</Button>
              )}

              {(mp.type === "release" || mp.status === "audited") && (
                <Button onClick={handleToAudit}>提交审核</Button>
              )}

              {mp.type === "beta" && mp.status !== "verifyReleasing" && (
                <Button size="small" onClick={handleToVerify}>
                  认证为正式小程序
                </Button>
              )}
            </Space>

            {((mp.type === "beta" && mp.status === "verifyReleasing") ||
              mp.type === "release" ||
              mp.status === "pushedBeta") && (
              <Collapse size="small" style={{ marginTop: "10px" }}>
                <Collapse.Panel header="高级设置" key="1">
                  <Space>
                    <Button size="small" onClick={handleSetDomain}>
                      重新设置WebView域名
                    </Button>
                    <Button size="small" onClick={handleSetApiDomain}>
                      重新设置接口域名
                    </Button>
                    <Button size="small" onClick={handleCommitCode}>
                      重新提交代码
                    </Button>
                  </Space>
                </Collapse.Panel>
              </Collapse>
            )}

            {mp.status === "verifyReleasing" && mp.verifyMessage && (
              <Alert type="warning" showIcon message={mp.verifyMessage} />
            )}

            {mp.status === "verifyReleasing" && !mp.verifyMessage && (
              <Alert
                type="warning"
                showIcon
                message={
                  <span>
                    提交认证成功，请联系法人代表，
                    <br />
                    在填写的法人微信号做人脸识别，
                    <br />
                    识别后使用绑定的微信管理员微信号，
                    <br />
                    确认审核!
                  </span>
                }
              />
            )}
            {mp.status === "verifyReleasing" && (
              <Tooltip placement="topLeft" title="刷新">
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={() => location.reload()}
                >
                  刷新
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </Spin>
  );
});

export default AppPublish;
