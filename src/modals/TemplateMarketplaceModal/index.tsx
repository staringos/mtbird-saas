import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  Radio,
  RadioChangeEvent,
  Pagination,
  Input,
  message,
  Tabs,
  Form,
} from "antd";
import styles from "./style.module.less";
import { IPageParams, IPagination, ITemplateDTO, IPart } from "@mtbird/shared";
import { getTemplateCategories, getTemplateList } from "../../apis/template";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import TemplateItem from "./TemplateItem";
import {
  DEFAULT_PAGE_TITLE,
  DEFAULT_TEMPLATE,
  OPTIONS,
  PAGE_DATA_EMPTY,
  PAGE_TYPE_SELECT,
} from "../../utils/constants";
import { isStringEmpty } from "../../utils";
import { addPage } from "../../apis";
import isString from "lodash/isString";
import clone from "lodash/clone";
import FORM_DATA from "../../test/formData";
import Router from "next/router";

export const MODAL_NAME = "TemplateMarketplaceModal";

const PageTemplateMarketplace = observer(() => {
  const { hideModal, modals, currentTeamId, currentAppId, getPages } =
    useStore();
  const [scope, setScope] = useState<string>("market");
  const [pagination, setPagination] = useState<IPageParams>();
  const [data, setData] = useState<IPagination<ITemplateDTO[]>>({
    total: 0,
    data: [],
  } as any);
  const visible = modals[MODAL_NAME];
  const [currentTemplate, setCurrentTemplate] = useState<number>(0);
  const [title, setTitle] = useState<string>(DEFAULT_PAGE_TITLE);
  const [categories, setCategories] = useState<IPart[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | undefined>(
    undefined
  );
  const [pageType, setPageType] = useState("mobile");

  const list = useMemo(() => {
    const defaultTemplate = clone(DEFAULT_TEMPLATE);
    if (pageType === "form") {
      defaultTemplate.content = FORM_DATA as any;
    }
    return [defaultTemplate, ...(data.data as any)];
  }, [data]);

  const refresh = async () => {
    const res = await getTemplateList(
      "page",
      scope,
      currentTeamId,
      currentCategory,
      pageType,
      pagination as IPageParams
    );
    setData(res);
  };

  const refreshCategory = async () => {
    const categories = await getTemplateCategories();
    setCategories([
      { label: "全部", value: undefined },
      ...categories.data.map((res) => {
        return {
          label: res.name,
          value: res.id,
        };
      }),
    ]);
  };

  useEffect(() => {
    refreshCategory();
  }, []);

  useEffect(() => {
    if (visible) {
      refresh();
    }
  }, [pagination, scope, visible, currentCategory, pageType]);

  const handleOk = async () => {
    if (isStringEmpty(title)) return message.error("请输入名称！");
    // if (!currentTemplate) return message.error("请选择页面模版！")
    if (!currentAppId) return message.error("请选择应用");

    const template = list[currentTemplate];
    let content = template.content || PAGE_DATA_EMPTY;

    if (isString(content)) {
      content = JSON.parse(content);
    }

    const res = await addPage(
      currentAppId,
      {
        title: title || DEFAULT_PAGE_TITLE,
        data,
        avatar: template.avatar,
        type: template.pageType || pageType,
      },
      content
    );
    handleCancel();
    getPages(currentAppId);
    message.success("添加成功");
    Router.push(`/editor/${res.data.id}`);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCancel = () => {
    hideModal(MODAL_NAME);
  };

  const handleScopeChange = (e: RadioChangeEvent) => {
    if (e.target.value !== "market") {
      setCurrentCategory(undefined);
    }
    setScope(e.target.value);
  };

  const handlePageChanged = (e: number) => {
    setPagination({
      ...pagination,
      pageNum: e,
    } as any);
  };

  const handleSelect = (index: number) => {
    setCurrentTemplate(index);
  };

  const handleCategoryChange = (e: RadioChangeEvent) => {
    setCurrentCategory(e.target.value);
  };

  const handlePageTypeChange = (e: string) => {
    setPageType(e);
    setCurrentTemplate(0);
  };

  return (
    <Modal
      className={styles.marketplaceModal}
      visible={visible}
      title="新建页面"
      onOk={handleOk}
      onCancel={handleCancel}
      width="80%"
      footer={[
        <Form.Item label="页面名称" key="input" colon={false}>
          <Input
            value={title}
            style={{ width: "200px" }}
            placeholder="请输入页面名称"
            onChange={handleTitleChange}
          />
        </Form.Item>,
        <div key="right">
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>
          <Button key="primary" type="primary" onClick={handleOk}>
            创建页面
          </Button>
        </div>,
      ]}
    >
      <div className={styles.modalContainer}>
        <Tabs
          activeKey={pageType}
          type="card"
          items={PAGE_TYPE_SELECT}
          onChange={handlePageTypeChange}
        />
        <Radio.Group
          options={OPTIONS}
          onChange={handleScopeChange}
          value={scope}
          optionType="button"
          buttonStyle="solid"
        />
        {scope === "market" && (
          <Radio.Group
            style={{ margin: "10px 0" }}
            options={categories}
            onChange={handleCategoryChange}
            value={currentCategory}
          />
        )}

        <div className={styles.templateList}>
          {list.map((cur: any, i: number) => {
            return (
              <TemplateItem
                template={cur}
                key={cur.id}
                isCurrent={i === currentTemplate}
                onClick={() => handleSelect(i)}
              />
            );
          })}
        </div>
        <Pagination
          style={{ color: "white" }}
          defaultCurrent={data.pageNum}
          total={data.total}
          onChange={handlePageChanged}
          size="small"
          showSizeChanger={false}
        />
      </div>
    </Modal>
  );
});

export default PageTemplateMarketplace;
