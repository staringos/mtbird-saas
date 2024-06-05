import React, { useEffect, useState } from "react";
import { Descriptions, Spin, Typography, Table } from "antd";
import { observer } from "mobx-react-lite";
import ManagerLayout from "../../../../layout/ManagerLayout";
import { getUserDetails } from "apis/platform";
import { useRouter } from "next/router";
import AvatarWithName from "../../../../components/Header/AvatarWithName";
import { dateFormatter } from "../../../../utils";

const { Title } = Typography;

interface IUserDto {
  nickname: string;
  avatar: string;
  registedIP: string;
  phone: string;
  createdAt: string;
}

const UserDetailsPage = observer(() => {
  const [data, setData] = useState({ data: [], pageNum: 1, total: 0 });
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<undefined | IUserDto>(undefined);

  const init = async (pageNum: number = 1) => {
    const res = await getUserDetails(id);
    setData(res);
  };

  useEffect(() => {
    init();
  }, []);

  if (!user)
    return (
      <ManagerLayout type="platform">
        <Spin />
      </ManagerLayout>
    );

  return (
    <ManagerLayout type="platform">
      <Descriptions title="用户详情">
        <Descriptions.Item label="用户">
          <AvatarWithName name={user?.nickname} avatar={user?.avatar} />
        </Descriptions.Item>
        <Descriptions.Item label="手机号">{user?.phone}</Descriptions.Item>
        <Descriptions.Item label="注册IP">{user?.registedIP}</Descriptions.Item>
        <Descriptions.Item label="注册时间">
          {dateFormatter(user?.createdAt)}
        </Descriptions.Item>
      </Descriptions>
      <Title level={3}>页面列表</Title>
      <Table />
    </ManagerLayout>
  );
});

export default UserDetailsPage;
