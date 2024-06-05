import React, { useEffect, useState } from "react";
import { Pagination, Table, Button } from "antd";
import { getFormData } from "apis/form";
import keys from "lodash/keys";
import styles from "./style.module.less";

interface IProps {
  formId?: string;
  pageId?: string;
}

const FormDataList = ({ formId, pageId }: IProps) => {
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageNum: 1,
  });

  const [data, setData] = useState<{ data: any[]; total: number }>({
    data: [],
    total: 0,
  });

  const initFormData = async () => {
    const res = await getFormData(pageId!, formId!, pagination);
    setData({
      ...res,
      data: res.data.map((cur: any) => {
        return {
          ...cur.data,
          创建时间: cur.createdAt,
          用户系统: cur.userAgent,
        };
      }),
    } as any);
  };

  useEffect(() => {
    if (!formId || !pageId) return;
    initFormData();
  }, [formId, pagination]);

  const handlePageChange = (page: number) => {
    setPagination({
      ...pagination,
      pageNum: page,
    });
  };

  const columns = keys(data?.data?.[0]).map((cur) => {
    return {
      title: cur,
      dataIndex: cur,
      key: cur,
    };
  });

  const handleDelete = () => {};

  columns.push({
    title: "操作",
    dataIndex: "id",
    // @ts-ignore
    render: (id: string) => {
      return (
        <Button type="text" key={id} onClick={() => handleDelete()}>
          删除
        </Button>
      );
    },
  });

  return (
    <div className={styles.formDataListWrapper}>
      <Table
        className={styles.formDataListContainer}
        dataSource={data.data}
        columns={columns}
        pagination={false}
      />
      <Pagination
        pageSize={pagination.pageSize}
        current={pagination.pageNum}
        total={data.total}
        onChange={handlePageChange}
      />
    </div>
  );
};

export default FormDataList;
