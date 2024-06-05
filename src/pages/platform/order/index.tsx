import React, { useEffect, useState } from "react";
import { Button, Table, Space, message } from "antd";
import { observer } from "mobx-react-lite";
import ManagerLayout from "../../../layout/ManagerLayout";
import { ColumnsType } from "antd/es/table";
import { IOrderDTO } from "@/types/entities/Order";
import { ORDER_STATUS, TEAM_VERSIONS_DICT } from "utils/constants";
import {
  getPlatformOrderList,
  confirmOrder,
  closeOrder,
} from "../../../apis/platform";
import AvatarWithName from "../../../components/Header/AvatarWithName";

const PlatformOrderListPage = observer(() => {
  const [data, setData] = useState({ data: [], pageNum: 1, total: 0 });

  const init = async (pageNum: number = 1) => {
    const orderRes = await getPlatformOrderList({ pageNum, pageSize: 10 });
    setData(orderRes);
  };

  useEffect(() => {
    init();
  }, []);

  const handlePageChange = (pageNum: number) => {
    init(pageNum);
  };

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

  const columns: ColumnsType<IOrderDTO> = [
    {
      title: "订单ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "团队",
      dataIndex: "teamId",
      key: "teamId",
      width: 100,
      render: (_, record) => {
        if (!record.team) return "";
        return (
          <AvatarWithName name={record.team.name} avatar={record.team.avatar} />
        );
      },
    },
    {
      title: "发起用户",
      dataIndex: "orderUserId",
      key: "orderUserId",
      width: 50,
      render: (_, record) => {
        return (
          <AvatarWithName
            name={record.user.nickname}
            avatar={record.user.avatar}
          />
        );
      },
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      render: (_) => TEAM_VERSIONS_DICT[_],
    },
    {
      title: "订阅周期",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "订阅时间",
      dataIndex: "times",
      key: "times",
    },
    {
      title: "订单状态",
      key: "status",
      render: (_, record) => ORDER_STATUS[record.status],
    },
    {
      title: "支付方式",
      key: "payWay",
      dataIndex: "payWay",
    },
    {
      title: "支付平台交易号",
      key: "tradeTransactionId",
      dataIndex: "tradeTransactionId",
    },
    {
      title: "订单金额",
      key: "price",
      dataIndex: "price",
    },
    {
      title: "创建时间",
      key: "createdAt",
      dataIndex: "createdAt",
    },
    {
      title: "支付时间",
      key: "payTime",
      dataIndex: "payTime",
    },
    {
      title: "操作",
      key: "opt",
      dataIndex: "id",
      render: (_, row) => (
        <Space>
          {row.status === "confirming" && (
            <Button onClick={() => handleConfirm(row)}>确认支付</Button>
          )}
          {(row.status !== "closed" ||
            row.status !== "created" ||
            row.status !== "confirming") && (
            <Button onClick={() => handleCloseOrder(row)}>关闭</Button>
          )}
        </Space>
      ),
    },
  ];

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

export default PlatformOrderListPage;
