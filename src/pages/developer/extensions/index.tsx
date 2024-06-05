import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Table, Button, Pagination, Image } from "antd";
import ManagerLayout from "../../../layout/ManagerLayout";
import { getExtensionManageList } from "../../../apis/extension";
import { ColumnsType } from "antd/lib/table";
import { useStore } from "store";
import Storage from "utils/Storage";
import { CURRENT_TEAM_STORAGE_KEY } from "@/utils/constants";
import { dateFormatter } from "../../../utils";

interface IExtensionManageDTO {
  id: string;
  name: string;
  description: string;
  version: string;
  latestVersion: string;
  updateTime: string;
  latestTime: string;
}

const ExtensionsPage: NextPage = () => {
  const { currentTeamId } = useStore();
  const [page, setPage] = useState<{ pageNum: number; pageSize: number }>({
    pageNum: 1,
    pageSize: 20,
  });
  const [data, setData] = useState<{
    total: number;
    data: IExtensionManageDTO[];
  }>({ total: 0, data: [] });

  const init = async () => {
    const teamId = Storage.getItem(CURRENT_TEAM_STORAGE_KEY);
    if (!currentTeamId && !teamId) return;
    const data = await getExtensionManageList(
      Storage.getItem(CURRENT_TEAM_STORAGE_KEY)
    );
    console.log("data:", data);
    setData(data);
  };

  useEffect(() => {
    init();
  }, [page, currentTeamId]);

  const handlePageChange = (p: number) => {
    setPage({ ...page, pageNum: p });
  };

  const columns: ColumnsType<IExtensionManageDTO> = [
    {
      title: "头图",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => {
        return <Image wdith="100px" src={avatar} />;
      },
    },
    {
      title: "唯一名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "描述",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "当前版本",
      dataIndex: "latestVersion",
      key: "latestVersion",
    },
    // {
    //   title: '最新版本',
    //   dataIndex: 'newestVersion',
    //   key: 'newestVersion',
    // },
    {
      title: "是否公开",
      dataIndex: "private",
      key: "private",
      render(value: boolean) {
        return value ? "团队私有" : "公开";
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: dateFormatter,
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: dateFormatter,
    },
    {
      title: "操作",
      dataIndex: "address",
      key: "id",
      render: (id: string, row: any) => {
        console.log("rrrrrr row:", row, id);
        return (
          <div>
            <Button type="link">删除</Button>
            {/* {row.version !== row.latestVersion && (<Button type="link">发布最新版本</Button>)}
          <Button type="link">回滚</Button> */}
          </div>
        );
      },
    },
  ];

  return (
    <ManagerLayout type="developer">
      <Table columns={columns} dataSource={data.data} pagination={false} />
      <Pagination
        style={{ marginTop: "10px" }}
        current={page.pageNum}
        pageSize={page.pageSize}
        total={data.total}
        onChange={handlePageChange}
      />
    </ManagerLayout>
  );
};

export default ExtensionsPage;
