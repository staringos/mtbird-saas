import React, { useEffect, useState } from "react";
import { Button, Tag, Modal, message } from "antd";
import { getDataModelFields, deleteDataModelField } from "apis/dataCenter";
import { DataType, IModelField } from "@mtbird/shared";
import { DATA } from "@mtbird/core";
import sortBy from "lodash/sortBy";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { List } from "@mtbird/ui";
import { useStore } from "store";
import { MODAL_NAME as ADD_DATA_MODEL_FIELD_MODAL } from "../../../modals/AddModelFieldModal";

const { confirm } = Modal;

interface IProps {
  modelId: string | undefined;
}

const DataTableModels = ({ modelId }: IProps) => {
  const { openModal } = useStore();
  const [fields, setFields] = useState<IModelField[]>([]);

  const refresh = async () => {
    if (!modelId) return setFields([]);
    const res = await getDataModelFields(modelId);
    setFields([
      ...sortBy(res.data, (o) => o.sort),
      ...DATA.DATA_MODEL_SYSTEM_FIELDS,
    ]);
  };

  useEffect(() => {
    refresh();
  }, [modelId]);

  const columns = [
    {
      key: "displayName",
    },
    {
      key: "type",
      render: (cur: Record<string, any>) => {
        return <Tag color="blue">{DATA.DATA_TYPE[cur.type as DataType]}</Tag>;
      },
    },
    {
      key: "key",
    },
  ];

  const handleToChange = (cur: IModelField) => {
    openModal(ADD_DATA_MODEL_FIELD_MODAL, {
      modelId,
      data: cur,
      afterClose: refresh,
    });
  };

  const handleDelete = (cur: Record<string, any>) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: "确认要删除这个字段吗？（历史数据中的该字段也会被删除哦）",
      onOk: async () => {
        await deleteDataModelField(modelId!, cur.id);
        message.success("操作成功!");
        refresh();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleAddField = () => {
    openModal(ADD_DATA_MODEL_FIELD_MODAL, {
      modelId,
      afterClose: refresh,
    });
  };

  return (
    <div>
      <Button onClick={handleAddField}>添加字段</Button>
      <List
        data={fields}
        columns={columns}
        onToChange={handleToChange as any}
        editable={(cur) => cur.isSystem}
        deleteable={(cur) => cur.isSystem}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DataTableModels;
