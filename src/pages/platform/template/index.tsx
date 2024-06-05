import React, { useEffect, useState } from "react";
import { Table, Space, Button, Switch, Modal, message } from "antd";
import { observer } from "mobx-react-lite";
import ManagerLayout from "../../../layout/ManagerLayout";
import { ColumnsType } from "antd/es/table";
import { IOrderDTO } from "@/types/entities/Order";
import { changeTemplatePrivate } from "apis/platform";
import AvatarWithName from "../../../components/Header/AvatarWithName";
import { getTemplateList } from "../../../apis/platform";
import { useRouter } from "next/router";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const TemplateListPage = observer(() => {
  const [data, setData] = useState({ data: [], pageNum: 1, total: 0 });
  const router = useRouter();

  const init = async (pageNum: number = 1) => {
    const res = await getTemplateList({ pageNum, pageSize: 10 });
    setData(res);
  };

  useEffect(() => {
    init();
  }, []);

  const handleEdit = async (template) => {
    router.push(`/platform/template/${template.id}/edit`);
  };

  const handleChangeIsPrivate = async (value, template) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认将该模版设为${value ? "私有" : "公开"}吗？`,
      onOk: async () => {
        await changeTemplatePrivate(template.id, value);
        message.success("操作成功!");
        init();
      },
    });
  };

  const columns: ColumnsType<IOrderDTO> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "模版名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "预览图",
      dataIndex: "avatar",
      key: "avatar",
      width: 100,
      render: (_, record) => {
        return <img width={100} src={_} />;
      },
    },
    {
      title: "团队",
      dataIndex: "teamId",
      key: "teamId",
      width: 100,
      render: (_, record) => {
        return (
          <AvatarWithName name={record.Team.name} avatar={record.Team.avatar} />
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
            name={record.User.nickname}
            avatar={record.User.avatar}
          />
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "是否私有",
      dataIndex: "isPrivate",
      key: "isPrivate",
      render: (_, row) => {
        return (
          <Switch checked={_} onChange={(e) => handleChangeIsPrivate(e, row)} />
        );
      },
    },
    {
      title: "页面类型",
      dataIndex: "pageType",
      key: "pageType",
    },
    {
      title: "模版类型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "操作",
      key: "opt",
      dataIndex: "id",
      render: (_, row) => (
        <Space>
          <Button onClick={() => handleEdit(row)}>编辑</Button>
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

export default TemplateListPage;
