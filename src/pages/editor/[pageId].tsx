import React, { useEffect, useState } from "react";
import Editor from "@mtbird/editor";
import { IExtensionDTO, IPageConfig, IModel } from "@mtbird/shared";
import { message } from "antd";
import { useStore } from "store";
import { publishPage } from "../../apis";
import { getExtensions } from "../../apis/extension";
import { getDataModels } from "../../apis/dataCenter";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { observer } from "mobx-react-lite";
import { page } from "../../test/pageData";
import { setGlobalTitle } from "@/utils/index";
import { CURRENT_TEAM_STORAGE_KEY } from "@/utils/constants";
import isString from "lodash/isString";
import EditorLayout from "../../layout/EditorLayout";
import { MODAL_NAME as TEMPLATE_SAVE_MODAL_NAME } from "../../modals/TemplateSaveModal";
import Storage from "utils/Storage";
import ModelDataSource from "apis/ModelDataSource";

interface IProps {
  store: {
    dispatch: any;
  };
}

const EditorWrapper = observer(({ store }: IProps) => {
  const [isSSR, setIsSSR] = useState(true);
  const [loading, setLoading] = useState(true);
  const [extensions, setExtensions] = useState<IExtensionDTO[]>([]);
  const [models, setModels] = useState<IModel[]>([]);
  const {
    toUpload,
    currentPage,
    currentPageVersion,
    setCurrentPage,
    saveNewVersion,
    pages,
    openModal,
    userInfo,
  } = useStore();
  const storagedTeamId = Storage.getItem(CURRENT_TEAM_STORAGE_KEY);

  const router = useRouter();
  const { pageId } = router.query;

  const handleUpload = async (files: any[]): Promise<string[]> => {
    return toUpload(files);
  };

  const loadingPage = async () => {
    const page = await setCurrentPage(pageId as string);
    const res = await getExtensions(page?.appId);
    const modelRes = await getDataModels(storagedTeamId);
    setExtensions(res.data);
    setModels(modelRes.data);
    setLoading(false);
  };

  useEffect(() => {
    setIsSSR(false);
    setLoading(true);

    if (pageId) loadingPage();
  }, [pageId]);

  if (!currentPage || !currentPageVersion || loading) {
    return <Loading />;
  }

  const content = (currentPageVersion as any).content;
  const data: any = isString(content) ? JSON.parse(content) : content;

  const pageConfig = {
    id: currentPage.id,
    title: currentPage.title,
    headImage: currentPage?.avatar,
    data: data || page.data,
    appId: currentPage.appId,
    type: currentPage.type,
  } as IPageConfig;

  setGlobalTitle(currentPage.title);

  const handleSave = async (data: IPageConfig, avatar: string) => {
    await saveNewVersion(data, avatar);
    // message.success("操作成功!")
  };

  const handlePreview = () => {
    window.open(`/preview/${currentPage.id}`);
  };

  const handlePublish = async (avatar) => {
    await publishPage(currentPage.id, avatar);
    message.success("页面发布成功!");
  };

  const handleRefreshDataModel = async () => {
    const modelRes = await getDataModels(storagedTeamId);
    setModels(modelRes.data);
  };

  const options = {
    pageConfig,
    pageList: pages,
    models,
    autoSave: true,
    modelDataSource: new ModelDataSource(),
    extensions: extensions.map((cur) => `${cur.name}@${cur.latestVersion}`),
    onlineUserList: userInfo ? [userInfo] : [],
    refreshDataModel: handleRefreshDataModel,
    onUpload: handleUpload,
    onSave: handleSave,
    onPreview: handlePreview,
    onPublish: handlePublish,
    onBack: () => {
      location.href = "/";
    },
    onPageChange: (id: string) => {
      location.href = "/editor/" + id;
    },
    onSaveTemplate: (content: string, avatarUrl: string) => {
      openModal(TEMPLATE_SAVE_MODAL_NAME, {
        avatarUrl,
        type: "component",
        pageId: currentPage.id,
        pageType: currentPage.type,
        content,
      });
    },
  };

  return (
    <EditorLayout loading={loading}>
      {!isSSR && options && <Editor options={options} />}
    </EditorLayout>
  );
});

export default EditorWrapper;
