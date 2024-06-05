import React, { useEffect, useMemo, useState } from "react";
import { Form, Space, Select, Button, message, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { addCategories, getAllCategories } from "apis/wx";
import sortBy from "lodash/sortBy";
import MPSetCategoryCerticates from "./MPSetCategoryCerticates";
import { IMiniProgramDto } from "@/types/entities/Wx";

const { Title } = Typography;

interface IProps {
  appId: string;
  mp: IMiniProgramDto;
  onSuccess: () => void;
}

const MPSetCategories = ({ mp, appId, onSuccess }: IProps) => {
  const [form] = Form.useForm();

  const categoriesWatch = Form.useWatch("categories", form);

  // const [fields, setFields] = useState([{}])
  const [categories, setCategories] = useState([]);
  const [level1Categories, setLevel1Categories] = useState([]);
  const [level2Categories, setLevel2Categories] = useState<any[]>([]);
  const [level3Categories, setLevel3Categories] = useState<any[]>([]);

  const init = async () => {
    const res = await getAllCategories(appId);
    // 去掉所有需要资质证明的类目
    const cates = res.data; // .filter(cur => cur.sensitive_type === 0)
    setCategories(cates);
    setLevel1Categories(
      cates
        .filter((cur: any) => cur.father === 0)
        .map((cur: any) => ({
          ...cur,
          label: cur.name,
          value: cur.id,
        }))
    );

    console.log(
      "[sort]:",
      sortBy(res.data, (cur) => cur.id)
    );
  };

  useEffect(() => {
    init();
  }, []);

  const needUpload = (level2Id: string) => {
    if (!level2Id) return undefined;
    return categories.find((cur: any) => cur.id === level2Id);
  };

  const handleAddCategories = async () => {
    const data = form.getFieldsValue();
    if (!data || !data.categories) return message.error("请设置类目");

    try {
      const res = await addCategories(appId, data.categories);
      console.log("res:", res);
      message.success("操作成功!");
      onSuccess();
    } catch (e: any) {
      return message.error(e.message);
    }
  };

  const handleSelectChange = (index: number, level: number) => {
    if (!categories) return;
    return (value: any) => {
      const allChildren = (categories as any)
        .filter((cur: any) => cur.father === value)
        .map((cur: any) => ({ ...cur, label: cur.name, value: cur.id }));

      switch (level) {
        case 1:
          const newArray = [...level2Categories];
          newArray[index] = allChildren;
          setLevel2Categories(newArray);
          break;
        case 2:
          const newArray3 = [...level3Categories];
          newArray3[index] = allChildren;
          setLevel3Categories(newArray3);
      }
    };
  };

  const handleSetValue = (key: any, value: any) => {
    form.setFieldValue(["categories", ...key], value);
  };

  return (
    <Form form={form}>
      <Title level={5}>名称[{mp.officalName}]审核成功，请设置小程序类目</Title>

      <Form.List name="categories">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, i) => (
              <Space
                key={key}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, "first_id"]}
                  rules={[{ required: true, message: "请选择一级类目" }]}
                >
                  <Select
                    placeholder="请选择一级类目"
                    options={level1Categories}
                    onChange={handleSelectChange(i, 1)}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "second_id"]}
                  rules={[{ required: true, message: "请选择二级类目" }]}
                >
                  <Select
                    placeholder="请选择二级类目"
                    options={level2Categories[i]}
                    onChange={handleSelectChange(i, 2)}
                  />
                </Form.Item>
                <MPSetCategoryCerticates
                  setFieldValue={handleSetValue}
                  name={name}
                  form={form}
                  restField={restField}
                  category={needUpload(categoriesWatch[name]?.second_id)}
                  categoryValue={categoriesWatch[name]}
                />

                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加类目
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Button type="primary" onClick={handleAddCategories}>
        提交类目
      </Button>
    </Form>
  );
};

export default MPSetCategories;
