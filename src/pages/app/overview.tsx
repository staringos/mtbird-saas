import React from "react";
import AppLayout from "layout/AppLayout";
import { Divider, Typography } from "antd";
const { Title, Paragraph, Text, Link } = Typography;

const OverviewPage = () => {
  return (
    <AppLayout>
      <Title level={2}>应用总览</Title>
      <Paragraph>
        应用总览包括应用的访问数据和用户使用数据
        <Link
          target="_blank"
          href="https://docs.staringos.com/?path=/docs/%E7%BC%96%E8%BE%91%E5%99%A8-%E9%A1%B5%E9%9D%A2--page&f=CMTOverviewPage"
        >
          文档
        </Link>
      </Paragraph>
      <Divider />
    </AppLayout>
  );
};

export default OverviewPage;
