import React from "react";
import Renderer from "@mtbird/renderer-web";
import { SchemaGenerator } from "@mtbird/core";
import styles from "./style.module.less";
import ModelDataSource from "../../../apis/ModelDataSource";
import { DATA } from "@mtbird/core";
import { useStore } from "../../../store";
import { observer } from "mobx-react-lite";

interface IProps {
  modelId: string;
}

const DataTableList = observer(({ modelId }: IProps) => {
  const { toUpload } = useStore();
  const dataSource = new ModelDataSource();
  const pageConfig = {
    // TODO fix search and sort problem in api
    data: SchemaGenerator.modelList(
      modelId,
      { add: true, delete: true, pagination: true, modify: true },
      DATA.DATA_MODEL_SYSTEM_COLUMNS
    ),
    // data: SchemaGenerator.formList(pageId, formId, {delete: true, pagination: true, search: true, sort: true}, additionColumns)
  };

  return (
    <div className={styles.listWrapper}>
      <Renderer
        dataSource={dataSource}
        pageConfig={pageConfig as any}
        onUpload={toUpload}
      />
    </div>
  );
});

export default DataTableList;
