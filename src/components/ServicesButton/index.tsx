import React, { useState } from "react";
import { Tooltip } from "antd";
import styles from "./style.module.less";
import { CustomerServiceOutlined, FileTextOutlined } from "@ant-design/icons";

const ServicesButton = (props: { hideDoc?: boolean }) => {
  const [display, setDisplay] = useState<boolean>(false);

  const handleClick = () => {
    setDisplay(!display);
  };

  const handleToDoc = () => {
    window.open("https://docs.staringos.com?f=CMTServicesButton");
  };

  return (
    <div className={styles.servicesButtonWrapper}>
      <div className={styles.buttonContent}>
        <Tooltip placement="left" title="联系客服">
          <div className={styles.servicesButton} onClick={handleClick}>
            <CustomerServiceOutlined />
          </div>
        </Tooltip>
        {!display && !props.hideDoc && (
          <Tooltip placement="left" title="查看文档">
            <div className={styles.servicesButton} onClick={handleToDoc}>
              <FileTextOutlined />
            </div>
          </Tooltip>
        )}
      </div>
      <div
        className={styles.servicesButtonContent}
        style={{ display: display ? "flex" : "none" }}
      >
        <p className={styles.title}>客户服务顾问</p>
        <p className={styles.desc}>有任何商务需求和意见反馈，欢迎联系我们</p>
        <img
          src="/statics/images/ew-qrcode.jpeg"
          className={styles.servicesButtonImage}
        />
      </div>
    </div>
  );
};

export default ServicesButton;
