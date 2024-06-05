import React, { useEffect } from "react";
import { IApplicationTemplate } from "../../types/entities/Application";
import { Card, Tooltip, Typography, Tag, Button } from "antd";
import styles from "./style.module.less";
import { getAppTemplates } from "../../apis/app";
import { PlatformTranslate } from "../../utils/constants";

const { Title, Text } = Typography;

interface IProps {
  data?: string | null;
  onChange: (id: string, template: IApplicationTemplate) => void;
}

const AppTemplateSelect = ({ data, onChange }: IProps) => {
  const [templates, setTemplates] = React.useState<IApplicationTemplate[]>([]);

  const init = async () => {
    const appRes = await getAppTemplates();
    setTemplates(appRes.data);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={styles.appTemplateList}>
      {templates.map((item: IApplicationTemplate) => {
        return (
          <Tooltip key={item.id}>
            <Card
              cover={<img src={item.avatar} />}
              onClick={() => {
                onChange(item.id, item);
              }}
              className={`${styles.card} ${
                data === item.id ? styles.selected : ""
              }`}
            >
              <Title level={5}>{item.name}</Title>
              <Text>{item.desc}</Text>
              {item.isPayMemberOnly && <Tag color="gold">👑 会员专享</Tag>}
              {!item.isPayMemberOnly && <Tag color="green">免费</Tag>}
              {item.platform && (
                <Tag color="geekblue">{(PlatformTranslate as Record<string, string>)[item.platform]}</Tag>
              )}
              <div className={styles.hoverCover}>
                {item.demoQrcodeUrl && (
                  <img className={styles.demoQrcode} src={item.demoQrcodeUrl} />
                )}
                {item.demoUrl && (
                  <Button href={item.demoUrl}>点击查看DEMO</Button>
                )}
              </div>
            </Card>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default AppTemplateSelect;
