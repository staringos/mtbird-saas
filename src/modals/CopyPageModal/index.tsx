import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Radio } from "antd";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { isStringEmpty } from "../../utils";
import { addPage } from "apis";
import isString from "lodash/isString";
import get from "lodash/get";
import { getPageDetails } from "../../apis";

export const MODAL_NAME = "COPY_PAGE_MODAL";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const initialData = { title: "" };

const CopyPageModal = observer(() => {
  const { modals, hideModal, getPages, currentAppId } = useStore();
  const [data, setData] = useState(initialData);

  const getPageLatestVersion = async (id: string) => {
    const res = await getPageDetails(id);
    const content = get(res, "data.history.content");
    return isString(content) ? JSON.parse(content) : content;
  };

  const handleOk = async () => {
    if (isStringEmpty(data.title)) return message.error("请输入名称！");
    if (!currentAppId) return message.error("请选择应用");
    const page = modals[MODAL_NAME];
    const content = await getPageLatestVersion(page.id);

    await addPage(
      currentAppId,
      {
        title: data.title,
        type: page.type,
        avatar: page.avatar,
        desc: page.desc,
      },
      content
    );
    handleCancel();
    getPages(currentAppId);
    return message.success("添加成功");
  };

  const handleCancel = () => {
    setData(initialData);
    hideModal(MODAL_NAME);
  };

  const handleChange = (key: string, e: any) => {
    setData({
      ...data,
      [key]: e.target ? e.target.value : e,
    });
  };

  return (
    <Modal
      title="复制页面"
      visible={modals[MODAL_NAME]}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form {...layout}>
        <Form.Item name="title" label="页面名称" rules={[{ required: true }]}>
          <Input
            value={data.title}
            onChange={(e) => handleChange("title", e)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default CopyPageModal;
