import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Table, Button, Pagination, Avatar, Modal, message } from "antd";
import ManagerLayout from "../../../layout/ManagerLayout";
import { getMemberList } from "../../../apis/team";
import { ColumnsType } from "antd/lib/table";
import { useStore } from "store";
import Storage from "utils/Storage";
import { CURRENT_TEAM_STORAGE_KEY } from "@/utils/constants";
import styles from "./style.module.less";
import { MODAL_NAME } from "modals/InviteMemberModal";
import { deleteMember } from "apis/team";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";

interface IExtensionManageDTO {
  id: string;
  name: string;
  description: string;
  version: string;
  latestVersion: string;
  updateTime: string;
  latestTime: string;
}

const MembersPage: NextPage = observer(() => {
  const { currentTeamId, openModal, currentTeam } = useStore();
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
    const data = await getMemberList(Storage.getItem(CURRENT_TEAM_STORAGE_KEY));

    const list = data.data.map((cur) => {
      return {
        ...cur,
        role: currentTeam?.creatorId === cur.id ? "创建者" : "成员",
      };
    });

    setData({
      ...data,
      data: list,
    });
  };

  useEffect(() => {
    init();
  }, [page, currentTeamId]);

  const handleInvite = () => {
    openModal(MODAL_NAME, {
      afterClose: () => init(),
    });
  };

  const handlePageChange = (p: number) => {
    setPage({ ...page, pageNum: p });
  };

  const handleRemoveMember = (id: string, nickname: string) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确定要从团队中移除用户(${nickname})吗？`,
      onOk: async () => {
        await deleteMember(currentTeamId, id);
        message.success("操作成功!");
        init();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const columns: ColumnsType<IExtensionManageDTO> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "名称",
      dataIndex: "nickname",
      key: "nickname",
      render: (nickname: string, row: any) => {
        return (
          <div>
            <Avatar src={row.avatar} />
            <span className={styles.username}>{nickname}</span>
          </div>
        );
      },
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "操作",
      dataIndex: "id",
      key: "id",
      render: (id: string, row: any) => {
        return (
          <div>
            <Button
              onClick={() => handleRemoveMember(id, row.nickname)}
              type="link"
              disabled={data.data.length < 2 || row.role === "创建者"}
            >
              移出
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <ManagerLayout type="team">
      <Button
        className={styles.invertButton}
        type="primary"
        onClick={handleInvite}
      >
        邀请成员
      </Button>
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
});

export default MembersPage;
