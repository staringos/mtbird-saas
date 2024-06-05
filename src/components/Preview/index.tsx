import React, { useState, useEffect } from "react";
import { getPageDetails } from "apis";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { IPage, IPageHistory } from "types/entities/Page";
import styles from "./style.module.less";
import { setGlobalTitle } from "@/utils/index";
import H5Preview from "../../components/Preview/H5Preview";
import PCPreview from "../../components/Preview/PCPreview";

type Props = {
  query: string | {
    appId: string,
    routeKey: string,
  }
}

const Page = (props: Props) => {
  const [isSSR, setIsSSR] = useState(true);

  // const { pageId } = router.query;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<IPage | null>(null);
  const [history, setHistory] = useState<IPageHistory | null>(null);
  const [platform, setPlatform] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    setIsSSR(false);

    const loadingPage = async () => {
      setLoading(true);
      const res = await getPageDetails(props.query);
      const { page, history } = res.data;
      setPage(page);
      setPlatform(page.type === "pc" ? "pc" : "mobile");

      if (!platform) setHistory(history);
      setLoading(false);
      setGlobalTitle(page?.title || "");
    };

    if (props.query && router.isReady) loadingPage();
  }, [props.query, router.isReady]);

  const handlePlatformChange = (e) => {
    setPlatform(e);
  };

  return (
    <div className={styles.previewContainer}>
      {loading && <Loading />}

      {!isSSR && !loading && platform === "mobile" && page && (
        <H5Preview
          page={page}
          historyId={history.id}
          platform={platform}
          onPlatformChange={handlePlatformChange}
        />
      )}

      {!isSSR && !loading && platform === "pc" && page && (
        <PCPreview
          page={page}
          historyId={history.id}
          platform={platform}
          onPlatformChange={handlePlatformChange}
        />
      )}
    </div>
  );
};

export default Page;
