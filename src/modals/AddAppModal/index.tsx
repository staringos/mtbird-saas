import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import set from "lodash/set";
import { useStore } from "store";
import UploadAvatar from "@/components/UploadAvatar";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import { addApp } from "apis/app";
import Storage from "utils/Storage";
import { CURRENT_APP_STORAGE_KEY } from "../../utils/constants";
import AppTemplateSelect from "../../components/AppTemplatesSelect";
import { IApplicationTemplate, IApplicationTemplateMetadata } from "../../types/entities/Application";
import AppTemplateMeta from "../../components/AppTemplateMeta";

export const MODAL_NAME = "ADD_APP_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const initialData = {
  name: "",
  avatar: "",
  type: 1,
  desc: "",
  templateId: null,
  metadata: undefined,
} as any;

const AddAppModal = observer(() => {
  const { modals, hideModal, getApplications, currentTeamId } = useStore();
  const [data, setData] = useState(initialData);

  const [currentSelectedTemplate, setCurrentSelectedTemplate] = useState<IApplicationTemplate>();
  const templateMeta = useMemo<IApplicationTemplateMetadata | undefined>(() => currentSelectedTemplate?.metadata, [currentSelectedTemplate])
  const [createLoading, setCreateLoading] = useState(false);

  const handleOk = async () => {
    if (isStringEmpty(data.name)) return message.error("请输入名称！");
    if (!currentTeamId) return message.error("请选择团队");


    if (templateMeta?.extraConfigSchema?.length) {
      const errorItem = templateMeta.extraConfigSchema.find((item) => {
        if (item.required && !data?.metadata?.[item.key]) {
          return item;
        }
      })

      if (errorItem) {
        message.error(errorItem.requiredMsg || `请输入${errorItem.label}`);
        return;
      }
    }

    try {
      setCreateLoading(true);
      const res = await addApp(currentTeamId, data);
      Storage.setItem(CURRENT_APP_STORAGE_KEY, res.data?.id);
      handleCancel();
      getApplications(currentTeamId);
      return message.success("添加成功");
    } catch (e: any) {
      console.log("e:", e);
      message.error(e.message || "添加失败");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancel = () => {
    setData(initialData);
    hideModal(MODAL_NAME);
  };

  const handleChange = (key: string, e: any) => {
    setData((old: Record<string, any>) => {
      set(old, key, e.target ? e.target.value : e)
      return {
        ...old
      }
    });
  };

  const files = data.avatar ? [data.avatar] : [];
  // const plainOptions = APP_TYPES.map((cur, i) => ({label: cur, value: i}))

  return (
    <Modal
      title="增加应用"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      confirmLoading={createLoading}
      width={"60%"}
      onCancel={handleCancel}
    >
      <Form {...layout}>
        <Form.Item name="name" label="应用名称" rules={[{ required: true }]}>
          <Input value={data.name} onChange={(e) => handleChange("name", e)} />
        </Form.Item>
        <Form.Item name="desc" label="应用介绍" rules={[{ required: false }]}>
          <Input value={data.desc} onChange={(e) => handleChange("desc", e)} />
        </Form.Item>
        <Form.Item
          name="type"
          label="选择应用模版"
          rules={[{ required: true }]}
        >
          <AppTemplateSelect
            data={data.templateId}
            onChange={(id, template) => {
              handleChange("templateId", id);
              console.log(template)
              setCurrentSelectedTemplate(template);
            }}
          />
        </Form.Item>
        <Form.Item name="avatar" label="图标">
          <UploadAvatar
            files={files}
            onChange={(e) => handleChange("avatar", e[0])}
            maxCount={1}
          />
        </Form.Item>
        {templateMeta?.extraConfigSchema && <Form.Item name="metadata" noStyle>
          <AppTemplateMeta schema={templateMeta?.extraConfigSchema} metadata={data.metadata} onChange={(key, value) => handleChange(`metadata.${key}`, value)} />
        </Form.Item>}
      </Form>
    </Modal>
  );
});

export default AddAppModal;
