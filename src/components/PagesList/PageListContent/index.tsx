import { observer } from "mobx-react-lite";
import React from "react";
import { useStore } from "store";
import { Button } from "antd";
import PageCard from "../PageCard";
import Center from "../../Center";
import useOpenAction from "utils/hooks/useOpenAction";

import styles from "./style.module.less";
import { IPage } from "types/entities/Page";
import { MODAL_NAME } from "../../../modals/CopyPageModal";
import { MODAL_NAME as EDIT_PAGE_MODAL_NAME } from "../../../modals/EditPageModal";
import { MODAL_NAME as TEMPLATE_SAVE_MODAL_NAME } from "../../../modals/TemplateSaveModal";
import { MODAL_NAME as ADD_PAGE_MODAL_NAME } from "../../../modals/TemplateMarketplaceModal";

import { setToHomePage } from "../../../apis";
import { message } from "antd";

const PageListContent = observer(() => {
  const { pages, openModal, currentAppId, refreshCurrentApp, currentTeamId } =
    useStore();

  useOpenAction();

  const handleToSavePageTemplate = async (page: IPage) => {
    openModal(TEMPLATE_SAVE_MODAL_NAME, {
      pageId: page.id,
      pageType: page.type,
      avatarUrl: page.avatar,
      type: "page",
    });
  };

  const handleToCopy = (page: IPage) => {
    openModal(MODAL_NAME, page);
  };

  const handleToEdit = (page: IPage) => {
    openModal(EDIT_PAGE_MODAL_NAME, page);
  };

  const handleSetHomePage = async (pageId: string) => {
    await setToHomePage(pageId, currentAppId);
    message.success("操作成功!");
    refreshCurrentApp(currentTeamId);
  };

  const handleAdd = () => {
    openModal(ADD_PAGE_MODAL_NAME);
  };

  return (
    <div className={styles.pageListContent}>
      {!pages ||
        (pages.length === 0 && (
          <Center>
            当前应用无页面，点击
            <Button type="link" onClick={handleAdd}>
              创建页面
            </Button>
          </Center>
        ))}
      {pages.map((cur, i) => {
        return (
          <PageCard
            key={i}
            page={cur}
            onSaveTemplate={handleToSavePageTemplate}
            onToCopy={handleToCopy}
            onSetHomePage={handleSetHomePage}
            onToEdit={handleToEdit}
          />
        );
      })}
    </div>
  );
});

export default PageListContent;
