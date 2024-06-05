import React, { useMemo } from "react";
import PreviewComponent from "@/components/Preview";
import { useRouter } from "next/router";

const Preview = () => {
  const router = useRouter();
  const { pageId, routeKey } = router.query;

  return (
    <PreviewComponent
      query={{
        /**
         * Different slug names for the same dynamic path
         * https://github.com/vercel/next.js/issues/9130
         */
        appId: pageId,
        routeKey,
      }}
    />
  );
};

export default Preview;
