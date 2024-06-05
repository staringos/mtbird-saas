import React, { useEffect, useState } from "react";
import { Button, Form, Input, Select, message, Spin } from "antd";
import { observer } from "mobx-react-lite";
import ManagerLayout from "../../../../layout/ManagerLayout";
import { getTemplateDetails, modifyTemplate } from "../../../../apis/platform";
import { useRouter } from "next/router";

const { TextArea } = Input;

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const TemplateListPage = observer(() => {
  const [data, setData] = useState({ data: [], pageNum: 1, total: 0 });
  const router = useRouter();
  const [form] = Form.useForm();
  const id = router.query.id as string;

  const init = async () => {
    const res = await getTemplateDetails(id as string);
    const data = res.data;
    data.content = JSON.stringify(data.content, null, 2);
    setData(res.data);
    form.setFieldsValue(res.data);
  };

  useEffect(() => {
    if (!id) return;
    init();
  }, [id]);

  const handleFinish = async () => {
    try {
      const data = form.getFieldsValue();
      if (!data) return;
      data.content = JSON.parse(data.content);
      await modifyTemplate(id, data);
      message.success("操作成功!");
      init();
    } catch (e) {
      message.error("内容格式错误!");
    }
  };

  if (!data) return <Spin />;

  return (
    <ManagerLayout type="platform">
      <Form
        form={form}
        onFinish={handleFinish}
        style={{ maxWidth: 600 }}
        colon={false}
      >
        <Form.Item name="name" label="模版名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="desc" label="模版描述" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
          <Select
            placeholder="Select a option and change input text above"
            allowClear
            options={[
              { value: "page", label: "页面" },
              { value: "component", label: "组件" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="pageType"
          label="页面类型"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select a option and change input text above"
            allowClear
            options={[
              { value: "pc", label: "PC" },
              { value: "mobile", label: "H5" },
              { value: "form", label: "表单" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="componentName"
          label="组件名称"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="content" label="内容" rules={[{ required: true }]}>
          <TextArea style={{ height: "300px" }} />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </ManagerLayout>
  );
});

export default TemplateListPage;
