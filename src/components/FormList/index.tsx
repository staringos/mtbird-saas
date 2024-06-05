// @ts-nocheck
// TODO 临时取消类型检查
import React, { useEffect, useState } from "react";
import { Form, Menu, message } from "antd";
import styles from "./style.module.less";
import PageSelect from "../PageSelect";
import { useStore } from "store";
import { getForms } from "apis/form";
import { observer } from "mobx-react-lite";
import FormListRender from "../FormListRender";
import Center from "../Center";

interface FormDTO {
  id: string;
}

const FormList = observer(() => {
  const { pages } = useStore();
  const [curPageId, setCurPageId] = useState(pages?.[0]?.id);
  const [forms, setForms] = useState<FormDTO[]>([]);
  const [curFormId, setCurFormId] = useState<string>();

  const handlePageChange = (e: string) => {
    setCurPageId(e);
    setCurFormId(undefined);
  };

  const initForms = async () => {
    try {
      const res = await getForms(curPageId);
      setForms(res.data);
      if (res.data && res.data.length) {
        setCurFormId(res.data[0].id);
      }
    } catch (e) {
      message.error(e.response?.data?.msg);
    }
  };

  const handleFormSelect = () => {};

  useEffect(() => {
    if (curPageId) {
      initForms();
    }
  }, [curPageId]);

  useEffect(() => {
    if (pages && pages.length) {
      setCurPageId(pages[0].id);
    }
  }, [pages]);

  return (
    <div className={styles.formListContainer}>
      <Form.Item label="选择页面">
        <PageSelect value={curPageId} onChange={handlePageChange} />
      </Form.Item>
      {!forms ||
        (forms.length === 0 && (
          <Center>当前页面无表单，请选择其他页面或在页面中创建表单</Center>
        ))}
      {forms && forms.length > 0 && (
        <div className={styles.formListContent}>
          <Menu
            onSelect={handleFormSelect}
            selectedKeys={[curFormId as string]}
          >
            {forms.map((cur, i) => {
              return (
                <Menu.Item key={cur.id}>{cur.id.substring(0, 5)}</Menu.Item>
              );
            })}
          </Menu>
          {curFormId && (
            <FormListRender pageId={curPageId} formId={curFormId} />
          )}
        </div>
      )}
    </div>
  );
});

export default FormList;
