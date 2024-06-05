import React, { useEffect, useState } from "react";
import { Table, Space, message, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import ManagerLayout from "../../../layout/ManagerLayout";
import { ColumnsType } from "antd/es/table";
import { IOrderDTO } from "@/types/entities/Order";
import { getUserList, confirmOrder, closeOrder } from "apis/platform";
import AvatarWithName from "../../../components/Header/AvatarWithName";
import { dateFormatter } from "../../../utils";
import { useRouter } from "next/router";

const UserListPage = observer(() => {
  const [data, setData] = useState({ data: [], pageNum: 1, total: 0 });
  const router = useRouter();

  const init = async (pageNum: number = 1) => {
    const res = await getUserList({ pageNum, pageSize: 10 });
    setData(res);
  };

  useEffect(() => {
    init();
  }, []);

  const handleConfirm = async (order: IOrderDTO) => {
    await confirmOrder(order.id);
    message.success("操作成功!");
    init();
  };

  const handleCloseOrder = async (order: IOrderDTO) => {
    await closeOrder(order.id);
    message.success("操作成功!");
    init();
  };

  const handleToDetail = (id: string) => {
    router.push(`/platform/user/${id}`);
  };

  const columns: ColumnsType<IOrderDTO> = [
    {
      title: "用户",
      dataIndex: "nickname",
      key: "nickname",
      width: 100,
      render: (_, record) => {
        return (
          <Tooltip title={record.id}>
            <AvatarWithName
              onClick={() => handleToDetail(record.id)}
              name={_}
              avatar={record.avatar}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "用户微信",
      dataIndex: "nickname",
      key: "nickname",
      width: 100,
      render: (_, record) => {
        if (!record?.UserWechatInfo) return;
        return (
          <AvatarWithName
            name={record?.UserWechatInfo?.nickname}
            avatar={record?.UserWechatInfo?.headImage}
          />
        );
      },
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "应用数量",
      dataIndex: "version",
      key: "version",
      render: (_, row) => row._count.Application,
    },
    {
      title: "页面数量",
      dataIndex: "_count.Page",
      key: "_count.Page",
      render: (_, row) => row._count.Page,
    },
    {
      title: "登录次数",
      dataIndex: "times",
      key: "times",
      render: (_, row) => row._count.UserLoginLog,
    },
    {
      title: "最近登录时间",
      key: "status",
      render: (_, record) => dateFormatter(record.UserLoginLog?.[0]?.createdAt),
    },
    {
      title: "注册时间",
      key: "createdAt",
      dataIndex: "createdAt",
      render: dateFormatter,
    },
    {
      title: "操作",
      key: "opt",
      dataIndex: "id",
      render: (_, row) => (
        <Space>
          {/* {row.status === 'confirming' && (
            <Button onClick={() => handleConfirm(row)}>确认支付</Button>
          )}
          {(row.status !== 'closed' || row.status !== 'created' || row.status !== 'confirming') && (
            <Button onClick={() => handleCloseOrder(row)}>关闭</Button>
          )} */}
        </Space>
      ),
    },
  ];

  const handlePageChange = (pageNum: number) => {
    init(pageNum);
  };

  return (
    <ManagerLayout type="platform">
      <Table
        columns={columns}
        scroll={{ x: true }}
        dataSource={data.data}
        pagination={{ ...data, onChange: handlePageChange }}
      />
    </ManagerLayout>
  );
});

export default UserListPage;
