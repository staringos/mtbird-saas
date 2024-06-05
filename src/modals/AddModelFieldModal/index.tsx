import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Select, Button } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { addDataModelField, updateDataModelField } from "apis/dataCenter";
import { DATA } from "@mtbird/core";
import { AppstoreAddOutlined } from "@ant-design/icons";
import List from "../../components/List";
import DataModelFieldOption, {
  IOptionItem,
} from "../../components/DataTable/DataModelFieldOption";

export const MODAL_NAME = "ADD_DATA_MODEL_FIELD_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const AddDataModelFieldModal = observer(() => {
  const { modals, hideModal, currentTeamId } = useStore();
  const [form] = Form.useForm();
  const [dataModels, setDataModels] = useState([]);
  const [dataModelFields, setDataModelFields] = useState([]);
  const id = modals[MODAL_NAME].modelId;
  const isEdit = !!modals[MODAL_NAME].data;
  const type = Form.useWatch("type", form);
  const [options, setOptions] = useState<any[]>([]);
  const [isAddOption, setIsAddOption] = useState(false);
  const [optionData, setOptionData] = useState<IOptionItem | undefined>(
    undefined
  );

  useEffect(() => {
    if (!modals[MODAL_NAME] || !modals[MODAL_NAME].data) {
      form.setFieldsValue({});
      setOptions([]);
      setOptionData(undefined);
      setIsAddOption(false);
    } else {
      const data = modals[MODAL_NAME].data;
      form.setFieldsValue(data);
      if (data.options) {
        setOptions(data.options);
      }
    }
  }, [modals[MODAL_NAME]]);

  const handleOk = async () => {
    const isValid = await form.validateFields();
    if (!isValid) return;

    const data = {
      ...form.getFieldsValue(),
      options,
    };

    try {
      if (isEdit) {
        await updateDataModelField(id, modals[MODAL_NAME].data.id, data);
      } else {
        await addDataModelField(id, data);
      }
      handleCancel();
      // refreshCurrentApp(currentAppId)
      return message.success("添加成功");
    } catch (e) {
      return message.error(e.message);
    }
  };

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  const optionsColumns = [
    {
      label: "显示名",
      key: "label",
    },
    {
      label: "值",
      key: "value",
    },
  ];

  const handleToChange = (data: IOptionItem, i: number) => {
    setIsAddOption(true);
    setOptionData({
      ...data,
      index: i,
    });
  };

  const handleDelete = (data, i) => {
    const newOptions = [...options];
    newOptions.splice(i, 1);
    setOptions(newOptions);
  };

  const handleToAddOption = () => {
    setIsAddOption(true);
  };

  const handleSaveOption = (data: any) => {
    if (!isNaN(optionData?.index as any)) {
      options.splice(optionData?.index || 0, 1, {
        label: data.label,
        value: data.value,
      });
      setOptions(options);
    } else {
      setOptions([...options, data]);
    }
    setIsAddOption(false);
    setOptionData(undefined);
  };

  const handleCancelOption = () => {
    setIsAddOption(false);
    setOptionData(undefined);
  };

  return (
    <Modal
      title={(isEdit ? "添加" : "修改") + "数据模型字段"}
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form {...layout} form={form}>
        <Form.Item
          name="displayName"
          label="名称"
          rules={[{ required: true, message: "域名不能为空!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="key"
          label="字段标识"
          rules={[{ required: true, message: "字段标识不能为空!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          label="字段类型"
          rules={[{ required: true, message: "请选择字段类型!" }]}
        >
          <Select options={DATA.DATA_TYPE_OPTIONS} />
        </Form.Item>
        {type === "ENUM" && (
          <Form.Item label="数据选项">
            <List
              columns={optionsColumns}
              data={options}
              onToChange={handleToChange}
              onDelete={handleDelete}
            />
            {isAddOption && (
              <DataModelFieldOption
                data={optionData}
                onSubmit={handleSaveOption}
                onCancel={handleCancelOption}
              />
            )}
            {!isAddOption && (
              <Button
                icon={<AppstoreAddOutlined />}
                onClick={handleToAddOption}
              >
                增加
              </Button>
            )}
          </Form.Item>
        )}

        {type === "RELATED" && (
          <Form.Item name="relatedDataModel" label="数据关联">
            <Select
              options={dataModels}
              onChange={(v) => form.setFieldsValue({ relatedDataModel: v })}
            />
          </Form.Item>
        )}

        {type === "RELATED" && (
          <Form.Item name="relatedDataModelField" label="数据关联">
            <Select
              options={dataModelFields}
              onChange={(v) =>
                form.setFieldsValue({ relatedDataModelField: v })
              }
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
});

export default AddDataModelFieldModal;
