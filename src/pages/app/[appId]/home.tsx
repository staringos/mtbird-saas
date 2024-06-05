import React from "react";
import PageRender from "@/components/PageRender";
import { useRouter } from "next/router";

const AppHomePage = () => {
  const router = useRouter();
  const { appId } = router.query;

  return <PageRender appId={appId} preview={false} />;
};

export default AppHomePage;
