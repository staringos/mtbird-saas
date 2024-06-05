import React, { useEffect, useState } from "react";
import { Form, Input, Modal, message, Spin } from "antd";
import { addTemplate } from "../../apis/template";
import { Events, EVENT_KEYS } from "@mtbird/core";
import isString from "lodash/isString";
import get from "lodash/get";
import { getPageDetails } from "../../apis";
import { useStore } from "store";
import { observer } from "mobx-react-lite";

// interface IProps {
//   avatarUrl: string | null | undefined;
//   onHide: () => void;
//   type?: 'component' | 'page';
//   pageId: string;
//   pageType: string;
// }

export const MODAL_NAME = "TemplatSaveModal";

const TemplateSaveForm = observer(() => {
  const { hideModal, modals } = useStore();
  const { avatarUrl, type, pageId, pageType } = modals[MODAL_NAME] || {};
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const teamId = localStorage.getItem("TSK") as string;
  const [content, setContent] = useState<string>("");
  // const activeContent = isString(content) ? JSON.parse(content) : content

  const getPageLatestVersion = async () => {
    const res = await getPageDetails(pageId);
    const content = get(res, "data.history.content");
    setContent(isString(content) ? JSON.parse(content) : content);
  };

  useEffect(() => {
    if (pageId && type === "page") {
      getPageLatestVersion();
    }
  }, [pageId]);

  useEffect(() => {
    if (modals[MODAL_NAME].content) {
      setContent(modals[MODAL_NAME].content);
    }
  }, [modals[MODAL_NAME]]);

  const handleOK = async () => {
    setLoading(true);

    const res = await addTemplate({
      name: form.getFieldValue("name"),
      type: type || "component",
      teamId,
      content,
      avatar: avatarUrl as string,
      pageType,
      isPrivate: true,
      componentName: content.componentName,
    });

    if (res.code === 200) {
      hideModal(MODAL_NAME);
      setLoading(false);
      Events.emit(EVENT_KEYS.TEMPLATE_ADDED);
      return message.success("操作成功!");
    }

    message.error(res.msg);
  };

  return (
    <Modal
      title="创建组件模版"
      open={modals[MODAL_NAME]}
      onOk={handleOK}
      onCancel={() => hideModal(MODAL_NAME)}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      <Spin spinning={loading} delay={500}>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item label="模版名称" name="name">
            <Input />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
});

export default TemplateSaveForm;
