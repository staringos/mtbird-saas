import React from "react";
import { Input, Button, Typography } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { IDomainDTO } from "@/types/entities/Application";

interface IProps {
  domain: IDomainDTO;
  currentAppId: string;
  onChange: () => void;
}

const DomainDisplay = ({ domain, currentAppId, onChange }: IProps) => {
  return (
    <div>
      <p>
        <CheckCircleTwoTone twoToneColor="#52c41a" /> 已绑定域名:
        <Typography.Text code>{domain.domainName}</Typography.Text>
        <Button type="link" style={{ marginLeft: 10 }} onClick={onChange}>
          修改域名 / 证书
        </Button>
      </p>
      <Input value={`https://${currentAppId}.app.staringos.com`} disabled />
    </div>
  );
};

export default DomainDisplay;
