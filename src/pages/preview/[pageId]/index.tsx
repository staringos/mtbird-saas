import React, { useMemo } from "react";
import PreviewComponent from "@/components/Preview";
import { useRouter } from "next/router";

const Preview = () => {
  const router = useRouter();
  const { pageId } = router.query;

  return <PreviewComponent query={pageId} />;
};

export default Preview;
