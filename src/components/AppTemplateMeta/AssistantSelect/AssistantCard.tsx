import React from "react";
import { Card } from "antd";
import Image from "next/image";
import clsx from "./../../../utils/clsx";
import { IAssistant } from "./../../../types/entities/Ai";

import styles from "./index.module.less";

type Props = {
  data: IAssistant;
  onClick: (assistant: IAssistant) => void;
  selectedId?: string;
};

const AssistantCard = ({ data, onClick, selectedId }: Props) => {
  return (
    <Card
      className={clsx(styles.assistantCard, {
        [styles.select]: selectedId == data.id,
      })}
      key={data.id}
    >
      <div className={styles.item} onClick={() => onClick(data)}>
        <div className={styles.avatar}>
          {data.textAvatar ? (
            data.textAvatar
          ) : (
            <Image width={100} height={100} src={data.avatar || "https://mtbird-cdn.staringos.com/product/images/staringai-logo.png"} alt={data.name} />
          )}
        </div>
        <p>{data.name}</p>
      </div>
    </Card>
  );
};

export default AssistantCard;
