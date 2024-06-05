import React from "react";
import { Card } from "antd";
import { ITemplateDTO } from "@mtbird/shared";
import { CheckCircleOutlined } from "@ant-design/icons";
import styles from "./style.module.less";

interface IProps {
  template: ITemplateDTO;
  isCurrent: boolean;
  onClick: (cur: ITemplateDTO) => void;
}

const TemplateItem = ({ template, isCurrent, onClick }: IProps) => {
  return (
    <Card
      className={styles.templateItem}
      hoverable
      cover={<img alt="example" src={template.avatar} />}
      onClick={() => onClick(template)}
    >
      <Card.Meta title={template.name} />
      {isCurrent && <CheckCircleOutlined className={styles.checkIcon} />}
    </Card>
  );
};

export default TemplateItem;
