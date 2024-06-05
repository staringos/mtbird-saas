import React, { FC, useEffect, useMemo, useState } from "react";
import { Button, Radio, RadioChangeEvent, Space } from "antd";
import styles from "./style.module.less";
import random from "lodash/random";
import PasswordLogin from "@/components/PasswordLogin";
import PhoneLogin from "@/components/PhoneLogin";
import WeixinLogin from "@/components/WeixinLogin";
import MPLogin from "@/components/WeixinLogin/MPLogin";
import WeixinGZHLogin from "@/components/WeixinGZHLogin";
import WorkWeixinLogin from "@/components/WorkWeixinLogin";
import ServicesButton from "../../components/ServicesButton";
import { STARINGAI_BRAND, BRAND_NAME } from "@/utils/constants";
import { isWechat, isWorkWechat, isMiniProgram } from "@/utils/weixin";
import { getLoginRedirectUrl, isAppLogin } from "./../../lib/login";
import { getItem } from "./../../lib/cache"
import { useStore } from "store";
import { isMobile as isMobileDevice, nativeIos } from "utils";
import { visitorLogin } from "/src/apis/user";
import { getApplicationById } from "/src/lib/services/app"
import { useRouter } from "next/router";
import * as cookie from "cookie";

import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from "@ant-design/cssinjs";
import { GetServerSideProps } from "next/types";
import ICPRecord from "@/components/ICPRecord";
import { AppleFilled } from "@ant-design/icons";

enum LoginMode {
  Verify = "verify",
  Password = "password",
  Weixin = "weixin",
  WorkWeixin = "WorkWeixin",
  MP = "MiniProgram"
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const isAudit = Number(await getItem("config:login:audit"))
  const defaultProps = { props: {
    isAudit,
    loginConfig: null,
  } };
  const clearToken = () => {
    const cookieStr = cookie.serialize("t", "", {
      path: "/",
    });
    context.res.setHeader("Set-Cookie", cookieStr);
  }

  // 主动退出
  if (context.query.isForceLogout) {
    clearToken();
    return defaultProps;
  }

  const parsedCookies = cookie.parse(context.req.headers.cookie || "");
  if (parsedCookies.t) {
    try {
      const { verify } = require("jsonwebtoken");
      const authData = verify(parsedCookies.t, process.env.JWT_SECRET);
      // 自动登录
      if (authData) {
        // app登录需要判断 appPath
        const to = decodeURIComponent((context.query.to as string) || '');
        if (isAppLogin(to)) {
          const appPath = to.replace(/^apps\//, '');
          if (!authData.appPath || appPath !== authData.appPath) {
            clearToken();
            return defaultProps;
          }
        } else {
          if (authData.appPath) {
            clearToken();
            return defaultProps;
          }
        }
        const query = context.query;
        const targetUrl = getLoginRedirectUrl(
          query as Record<string, any>,
          parsedCookies.t
        ) || '/';
        return {
          redirect: {
            destination: targetUrl,
            permanent: false,
          },
        }
      }
    } catch (error) {
      clearToken();
    }
  }

  const app = await getApplicationById(context.query.to);
  if (app) {
    defaultProps.props.loginConfig = app.applicationLoginConfig || undefined;
  }

  return defaultProps;
};

const LoginPage: FC = ({ isAudit, loginConfig }: { isAudit?: boolean, loginConfig?: any }) => {
  const [mode, setMode] = useState<LoginMode>(LoginMode.Verify);
  const router = useRouter();
  const store = useStore();

  useEffect(() => {
    loginConfig && store.setLoginConfig(loginConfig);
  }, [loginConfig]);

  console.log('process.env.NEXT_PUBLIC_IS_INSTALL', process.env.NEXT_PUBLIC_IS_INSTALL);

  // https://nextjs.org/docs/messages/react-hydration-error
  const [isInWechatBrowser, setIsInWechatBrowser] = useState(false);
  useEffect(() => setIsInWechatBrowser(() => isWechat()), []);

  const [isInWorkWechatBrowser, setIsInWorkWechatBrowser] = useState(false);
  useEffect(() => setIsInWorkWechatBrowser(() => isWorkWechat()), []);

  
  const [isInMiniProgram, setIsInMiniProgram] = useState(false);
  useEffect(() => {
    isMiniProgram().then(isMP => {
      setIsInMiniProgram(isMP);
    })
  }, [])

  const to = router.query.to as string;
  const redirectUrl = router.query.redirectUrl as string;
  const appId = router.query.appId as string | undefined;

  const image: string = useMemo(
    () => `/statics/images/bg0${random(1, 4)}.jpg`,
    []
  );

  const isToStaringAI = useMemo(
    () => to === BRAND_NAME.STARINGAI_XIAOXING,
    [to]
  );

  const handleModeChange = (e: RadioChangeEvent) => {
    console.log("e:", e);
    setMode(e.target.value);
  };

  const siteConfig = useMemo(() => {
    const { siteLogo, siteSlogan, siteTitle } = router.query;

    if (siteTitle) document.title = String(siteTitle);

    const brand = STARINGAI_BRAND[to] || STARINGAI_BRAND.Default;

    return {
      logo: loginConfig?.logo|| siteLogo || brand.logo,
      slogan: loginConfig?.title || siteSlogan || brand.slogan,
    };
  }, [router.query, to, loginConfig]);

  useEffect(() => {
    // 企业微信应用要求：即开即用，安装应用打开应用即可登录正常使用
    if (isInWorkWechatBrowser) {
      setMode(LoginMode.WorkWeixin);
      return;
    }

    // 微信环境
    // if (!isInWechatBrowser && !isInWorkWechatBrowser) return;

    // 前往小星
    if (!isToStaringAI) return;

    if (!router.isReady) return;

    if (isInWorkWechatBrowser) {
      setMode(LoginMode.WorkWeixin);
      return;
    }

    if (isWechat() || !isMobileDevice()) {
      setMode(LoginMode.Weixin);
    }
    
    // else if (isInWechatBrowser) {
    //   setMode(LoginMode.Weixin);
    // } else if (router.query?.code && router.query?.state) {
    //   setMode(LoginMode.Weixin);
    // }

    // if (isInMiniProgram) {
    //   setMode(LoginMode.MP);
    // }
  }, [
    router.query,
    isInWechatBrowser,
    isToStaringAI,
    router.isReady,
    isInWorkWechatBrowser,
    isInMiniProgram
  ]);

  const showWechatLoginEntry = useMemo(() => {
    if (isInWorkWechatBrowser) return false;

    if (!isToStaringAI) return false;
    if (isMobileDevice() && !isWechat()) return false;

    return true;
  }, [isInWorkWechatBrowser, isToStaringAI]);

  const onVisitorClick = () => {
    visitorLogin().then((res) => {
      if (res.data.token) {
        store.afterLogin(to, redirectUrl, res.data.token, loginConfig.loginCallbackUrl);
      }
    });
  };

  return (
    <StyleProvider
      hashPriority="high"
      transformers={[legacyLogicalPropertiesTransformer]}
    >
      <div
        className={styles.loginWrapper}
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className={styles.loginContainer}>
          <div
            className={styles.loginImage}
            style={{ backgroundImage: `url(/statics/images/login2.png)` }}
          >
            {/* <img src="/statics/images/login.png" width="100%" height="100%" /> */}
          </div>

          <div className={styles.loginBox}>
            <div className={styles.loginBoxLogo}>
              <div>
                <img
                  className={styles.logo}
                  src={siteConfig.logo}
                  width="200px"
                  style={!to ? { height: 80 } : undefined}
                />
              </div>
              <h3 style={{ fontWeight: 300, marginTop: "10px" }}>
                {siteConfig.slogan}
              </h3>
            </div>
            <div className={styles.loginFormWrapper}>
              {!isInWorkWechatBrowser && (
                <Radio.Group
                  className={styles.loginTypeSwitch}
                  onChange={handleModeChange}
                  value={mode}
                >
                  <Radio.Button value={LoginMode.Verify}>验证码</Radio.Button>
                  <Radio.Button value={LoginMode.Password}>密码</Radio.Button>
                  {/* {isInMiniProgram && isToStaringAI &&<Radio.Button value={LoginMode.MP}>小程序</Radio.Button>} */}
                  {showWechatLoginEntry && (
                    <Radio.Button value={LoginMode.Weixin}>微信</Radio.Button>
                  )}
                  {isInWorkWechatBrowser && isToStaringAI && (
                    <Radio.Button value={LoginMode.WorkWeixin}>
                      企业微信
                    </Radio.Button>
                  )}
                </Radio.Group>
              )}
              {mode === LoginMode.Password && (
                <PasswordLogin
                  redirectUrl={redirectUrl}
                  to={to}
                  appId={appId}
                  query={router.query}
                />
              )}
              {mode === LoginMode.Verify && (
                <PhoneLogin
                  redirectUrl={redirectUrl}
                  to={to}
                  appId={appId}
                  query={router.query}
                />
              )}
              {mode === LoginMode.Weixin &&
                (!isMobileDevice() ? (
                  <WeixinGZHLogin
                  className={styles.weixinLogin}
                  redirectUrl={redirectUrl}
                  to={to}
                  appId={appId}
                  query={router.query}
                />
                ) : (
                  <WeixinLogin
                    className={styles.weixinLogin}
                    redirectUrl={redirectUrl}
                    to={to}
                    appId={appId}
                    query={router.query}
                  />
                ))}
              {mode === LoginMode.WorkWeixin && (
                <WorkWeixinLogin
                  className={styles.workWeixinLogin}
                  redirectUrl={redirectUrl}
                  to={to}
                  appId={appId}
                  query={router.query}
                />
              )}

              {
                mode === LoginMode.MP && (
                  <MPLogin
                    className={styles.workWeixinLogin}
                    redirectUrl={redirectUrl}
                    to={to}
                    appId={appId}
                    query={router.query}
                  />
                )
              }
              {nativeIos && !!isAudit && (
                <Space>
                  <Button
                    className="loginBtn appleLogin"
                    type="primary"
                    htmlType="submit"
                    onClick={onVisitorClick}
                  >
                    游客登录
                  </Button>
                  <Button
                    className="loginBtn appleLogin"
                    type="primary"
                    htmlType="submit"
                    onClick={onVisitorClick}
                  >
                    <Space>
                      <AppleFilled /> Continue withApple
                    </Space>
                  </Button>
                </Space>
              )}
          
            <p className={styles.serviceAgreement}>您登录即同意 <a target="_blank" href="https://mtbird-cdn.staringos.com/product/docs/%E6%98%9F%E6%90%ADAI%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE.pdf" rel="noreferrer">服务协议</a> 和 <a target="_blank" href="https://mtbird-cdn.staringos.com/product/docs/%E6%98%9F%E6%90%ADAI%20%E9%9A%90%E7%A7%81%E6%94%BF%E7%AD%96.pdf" rel="noreferrer">隐私条款</a></p>
            </div>
          </div>
        </div>

        <ServicesButton />
      </div>
      <ICPRecord />

    </StyleProvider>
  );
};

export default LoginPage;
