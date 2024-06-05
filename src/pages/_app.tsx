import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import jsxRuntime from "react/jsx-runtime";
import { ConfigProvider, theme } from "antd";
import Head from "next/head";
import "../styles/globals.less";
import type { AppProps } from "next/app";
import Loader from "../components/LoadingScreen";
import dynamic from "next/dynamic";
import "@mtbird/editor/dist/index.css";
import "@mtbird/ui/dist/index.css";
import "antd/dist/reset.css";
import {
  GLOBAL_DEFAULT_TITLE,
  GLOBAL_DEFAULT_DESC,
  GLOBAL_DEFAULT_KEYWORD,
} from "utils/constants";
import { Store, StoreProvider } from "store";
import zhCN from "antd/lib/locale/zh_CN";
import { Router, useRouter } from "next/router";
import * as core from "@mtbird/core";
import axios from "axios";
import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from "@ant-design/cssinjs";

const ICPRecord = dynamic(() => import("../components/ICPRecord"), {
  ssr: false
});

// router change event for baidu tongji
// https://www.lingjie.tech/article/2020-12-27/26
Router.events.on("routeChangeComplete", (url) => {
  const anyWin = window as any;
  if (!anyWin._hmt || process.env.NODE_ENV === "development") return;
  try {
    anyWin._hmt.push(["_trackPageview", url]);
  } catch (e) {}
});

if (process.browser) {
  (window as any)["react"] = React;
  (window as any)["reactDom"] = ReactDOM;
  (window as any)["react-dom"] = ReactDOM;
  (window as any)["jsxRuntime"] = jsxRuntime;
  (window as any)["react/jsxRuntime"] = jsxRuntime;
  (window as any)["core"] = core;
  (window as any)["axios"] = axios;
} else {
  (global as any)["react"] = React;
  (global as any)["jsxRuntime"] = jsxRuntime;
  (global as any)["react/jsxRuntime"] = jsxRuntime;
  (global as any)["core"] = core;
}

const store = new Store();

const getAnalyticsTag = () => {
  return {
    __html: `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?da43a4063f5e0eeb1009dd492658d253";
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();`,
  };
};

function MyApp({ Component, pageProps }: AppProps) {
  const env = process.env.NODE_ENV;

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <StoreProvider store={store}>
        <Head>
          <title>{GLOBAL_DEFAULT_TITLE}</title>
          <meta name="description" content={GLOBAL_DEFAULT_DESC}></meta>
          <meta name="keyword" content={GLOBAL_DEFAULT_KEYWORD}></meta>
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
          <meta
            content="width=device-width, height=device-height, initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover"
            name="viewport"
          />
          {env === "production" && (
            <script dangerouslySetInnerHTML={getAnalyticsTag()} />
          )}
        </Head>
        <Loader>
          <Component {...pageProps} />
          
        </Loader>
      </StoreProvider>
    </ConfigProvider>
  );
}

export default MyApp;
