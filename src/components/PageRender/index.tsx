import Renderer from "@mtbird/renderer-web";
import React, { useState, useEffect } from "react";
import FormDataSource from "apis/FormDataSource";
import { getPageDetails, getPagePublished } from "apis";
import { initWx } from "apis/wx";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { IPage, IPageHistory } from "types/entities/Page";
import styles from "./style.module.less";
import { setGlobalTitle } from "@/utils/index";
import Head from "next/head";
import isString from "lodash/isString";
import { useStore } from "../../store";
// import wx from 'weixin-js-sdk';

interface IProps {
  preview: boolean;
  appId?: string;
}

const PageRender = ({ preview, appId }: IProps) => {
  const { toUpload } = useStore();
  const [isSSR, setIsSSR] = useState(true);
  const router = useRouter();
  const { pageId: queryPageId, routeKey: queryRouteKey } = router.query;

  // 当存在 queryRouteKey 是，queryPageId 为 app id 
  const [pageId, setPageId] = useState(queryRouteKey ? undefined : queryPageId);
  useEffect(() => {
    !queryRouteKey && setPageId(queryPageId);
  }, [router.isReady, queryRouteKey, queryPageId])

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<IPage | null>({
    data: {},
  });
  const [history, setHistory] = useState<IPageHistory | null>(null);
  const [data, setData] = useState({});
  const [dataSource, setDataSource] = useState();

  const handleDataChange = (value: any) => {
    setData(value);
    setDataSource(new FormDataSource(pageId, data, handleDataChange));
  };


  useEffect(() => {
    if (pageId && data) {
      setDataSource(new FormDataSource(pageId, data, handleDataChange));
    }
  }, [pageId, data])

  
  useEffect(() => {
    setIsSSR(false);

    const loadingPage = async () => {
      setLoading(true);
      let res;

      if (preview) {
        res = await getPageDetails(queryRouteKey ? {
          /**
           * Different slug names for the same dynamic path
           * https://github.com/vercel/next.js/issues/9130
           */
          appId: queryPageId,
          routeKey: queryRouteKey,
        } : pageId, false);
      } else {
        res = await getPagePublished(queryRouteKey ? {
            appId: queryPageId,
            routeKey: queryRouteKey,
          } :  (pageId as string) || "home",
          appId,
          location.hostname
        );
      }

      setPage({
        ...res.data.page,
        data: isString(res.data.history?.content)
          ? JSON.parse(res.data.history?.content)
          : res.data.history?.content || {},
      });
      setHistory(res.data.history);
      setLoading(false);
      setGlobalTitle(res.data?.page?.title || "");
      
      const pId = res.data?.page?.id;
      pId && pId !== pageId && setPageId(res.data?.page?.id)
      !isSSR && initWx(res.data.page);
    };

    if ((pageId || appId) || (queryPageId && queryRouteKey)) loadingPage();
  }, [pageId, appId, queryPageId, queryRouteKey]);

  const onClick = () => {};
  const onUpload = async (files: any) => [""];

  return (
    <div className={styles.previewContainer}>
      <Head>
        {/* <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, height=device-height, maximum-scale=1.0, user-scalable=no;"
        /> */}
        <meta
          content="width=device-width, height=device-height, initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover"
          name="viewport"
        />

        <title>{page.title}</title>
        <meta name="description">{page.desc}</meta>
      </Head>
      {loading && <Loading />}
      {!isSSR && !loading && (
        <Renderer
          isZoom={true}
          dataSource={dataSource}
          pageConfig={page}
          platform={page.type === "pc" ? "pc" : "mobile"}
          onClick={onClick}
          onUpload={toUpload}
        />
      )}
    </div>
  );
};

export default PageRender;
