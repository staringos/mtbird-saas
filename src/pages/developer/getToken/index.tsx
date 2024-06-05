import React, { useState } from "react";
import type { NextPage } from "next";
import FormItem from "antd/lib/form/FormItem";
import { Button, Divider, Input, message, Typography, Space } from "antd";
import { observer } from "mobx-react-lite";
import { getExtensionToken } from "apis/extension";
import { useStore } from "store";
import ManagerLayout from "../../../layout/ManagerLayout";
import { CopyToClipboard } from "react-copy-to-clipboard";

const { Title, Paragraph, Text, Link } = Typography;

const DevsPage: NextPage = observer(() => {
  const [token, setToken] = useState<string | null>(null);
  const { currentTeamId } = useStore();

  const handleGetToken = async () => {
    const res = await getExtensionToken(currentTeamId);
    setToken(res.data.token);
  };

  const handleCopyed = () => {
    message.success("已复制到剪切板");
  };

  return (
    <ManagerLayout type="developer">
      <Title level={2}>开发者</Title>
      <Paragraph>
        开发者工具，具体请参考
        <Link
          target="_blank"
          href="https://docs.staringos.com/?path=/docs/%E6%8B%93%E5%B1%95-%E5%8F%91%E5%B8%83--page&f=CMTDevsPage"
        >
          文档
        </Link>
      </Paragraph>
      <Divider />
      <FormItem label="拓展开发">
        <Space align="start">
          <FormItem colon={false}>
            {token ? (
              <Input value={token} disabled />
            ) : (
              <Button onClick={handleGetToken}>获取拓展开发Token</Button>
            )}
          </FormItem>
          {token ? (
            <CopyToClipboard text={token} onCopy={handleCopyed}>
              <Button type="link">点击复制</Button>
            </CopyToClipboard>
          ) : (
            ""
          )}
        </Space>
      </FormItem>
    </ManagerLayout>
  );
});

export default DevsPage;
