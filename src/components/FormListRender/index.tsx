import React from "react";
import { SchemaGenerator } from "@mtbird/core";
import Renderer from "@mtbird/renderer-web";
import FormDataSource from "apis/FormDataSource";
import styles from "./style.module.less";

interface IProps {
  pageId: string;
  formId: string;
}

const FormListRender = ({ pageId, formId }: IProps) => {
  // const [data, setData] = useState({});

  // const handleDataChange = (value: any) => {
  //   setData(value)
  //   setDataSource(new FormDataSource(data, handleDataChange, pageId))
  // }

  // const [dataSource, setDataSource] = useState(new FormDataSource(data, handleDataChange, pageId))
  const dataSource = new FormDataSource(pageId);

  const additionColumns = [
    {
      title: "创建时间",
      dataIndex: "createdAt",
      render:
        '(value) => value.split("T").join(" ").substring(0, value.lastIndexOf(":"))',
    },
    {
      title: "用户信息",
      width: 150,
      dataIndex: "userAgent",
    },
  ];

  const pageConfig = {
    // TODO fix search and sort problem in api
    data: SchemaGenerator.formList(
      pageId,
      formId,
      { delete: true, pagination: true },
      additionColumns
    ),
    // data: SchemaGenerator.formList(pageId, formId, {delete: true, pagination: true, search: true, sort: true}, additionColumns)
  };

  return (
    <div className={styles.formListWrapper}>
      <Renderer dataSource={dataSource} pageConfig={pageConfig as any} />
    </div>
  );
};

export default FormListRender;
