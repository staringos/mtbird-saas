import React from "react";
import { Typography, Button, Divider } from "antd";
import styles from "./style.module.less";
import { useRouter } from "next/router";
import { IBox } from "types/entites/Team";
import { MODAL_NAME as CUSTOMER_SERVICE_MODAL } from "modals/CustomerServiceModal";

const { Title } = Typography;

interface IProps {
  box: IBox;
  openModal: (name: string) => void;
}

const UpgradeBox = ({ box, openModal }: IProps) => {
  const {
    name,
    desc,
    list,
    unitPrice,
    period,
    discount,
    buttonTitle,
    showPrice,
    version,
    isStart,
  } = box;
  const router = useRouter();

  const handleUpgrade = (title: string) => {
    if (title === "获取报价" || title === "获取方案") {
      return openModal(CUSTOMER_SERVICE_MODAL);
    }
    router.push(
      `/team/upgrade/order?version=${version}&period=${
        period === "月" ? "monthly" : "yearly"
      }`
    );
  };

  return (
    <div className={styles.upgradeBox}>
      <div className={styles.upgradeBoxTitleArea}>
        <Title level={3}>{name}</Title>
        <span>{desc}</span>
      </div>
      <Divider />
      <ul className={styles.upgradeBoxList}>
        {list.map((cur, i) => {
          return (
            <li className={styles.upgradeBoxListItem} key={i}>
              <span className={styles.upgradeBoxListTitle}>{cur.title}</span>
              <span>{cur.desc}</span>
            </li>
          );
        })}
      </ul>
      <div className={styles.upgradeBoxPriceArea}>
        <span className={styles.discount}>{discount}</span>
        {!isStart && showPrice && (
          <span>
            ¥<span className={styles.price}>{unitPrice}</span>/{period}
          </span>
        )}
        {isStart && showPrice && (
          <span>
            ¥<span className={styles.price}>{unitPrice}</span>起
          </span>
        )}
      </div>
      <Button
        className={styles.upgradeBoxButton}
        type={box.buttonType}
        disabled={box.buttonDisabled}
        onClick={() => handleUpgrade(buttonTitle)}
      >
        {buttonTitle}
      </Button>
    </div>
  );
};

export default UpgradeBox;
