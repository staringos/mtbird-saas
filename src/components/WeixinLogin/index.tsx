import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Spin, message } from "antd";
import clsx from "@/utils/clsx";
import { requestWechatAuthorize } from "@/utils/weixin";
import { getRegistryInfoFromQuery, isMobile as isMobileDevice } from "utils";
import { useStore } from "store";
import { isWechat, isWorkWechat } from "@/utils/weixin";
import { observer } from "mobx-react-lite";
import { WechatOutlined } from "@ant-design/icons";
import PhoneBind from "components/PhoneBind";
import WxLogin from "@/utils/3rd/wxLogin";
import styles from "./style.module.less";

interface IProps {
  to: string;
  appId?: string;
  redirectUrl?: any;
  query?: Record<any, string>;
  className?: string;
}

const WeixinLogin = observer(
  ({ to, appId, redirectUrl, query, className }: IProps) => {
    const store = useStore();
    const [phoneBindModal, setPhoneBindModal] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [currentToken, setCurrentToken] = useState(false);

    const onLogin = () => {
      const url = requestWechatAuthorize(location.href);
      location.href = url;
    };

    const resetUrl = () => {
      const url = new URL(location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");

      history.replaceState(null, "", url.toString());
    };

    const requestAuthorize = async () => {
      if (!query?.code || !query?.state) {
        return;
      }
      const { code, state } = query;

      try {
        setIsLoggingIn(true);

        const result = await store.weixinAuthorize(
          code,
          to,
          appId,
          state,
          getRegistryInfoFromQuery(query)
        );

        setCurrentToken(result.token);
        resetUrl();
        if (!result.phone && !localStorage.getItem("cancel_bind_phone")) {
          setPhoneBindModal(true);
        } else {
          store.afterLogin(to, redirectUrl, result.token);
          setTimeout(() => setIsLoggingIn(false), 500);
        }
      } catch (error) {
        console.log(error);
        setIsLoggingIn(false);
        message.error(error.msg || "微信登录失败，请稍后重试");
      }
    };

    const onBindCancel = () => {
      localStorage.setItem("cancel_bind_phone", "1");
      store.afterLogin(to, redirectUrl, currentToken);
      setTimeout(() => setIsLoggingIn(false), 500);
    };

    const onBindSuccess = () => {
      store.afterLogin(to, redirectUrl, currentToken);
      setTimeout(() => setIsLoggingIn(false), 500);
    };

    const onBindFailed = (msg: string) => {
      if (msg) {
        message.error(msg);
      }
    };

    useEffect(() => {
      requestAuthorize();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const showLoginQrcode = useMemo(
      () => !isMobileDevice() && !isWechat(),
      []
    );

    const isInWechatBrowser = useMemo(() => {
      if (typeof window === undefined) return false;
      return isWechat() && !isWorkWechat()
    }, [])

    useEffect(() => {
      showLoginQrcode &&
        new WxLogin({
          self_redirect: false,
          id: "wxQrCode",
          appid: process.env.NEXT_PUBLIC_WX_WEBSITE_APPID,
          scope: "snsapi_login",
          redirect_uri: encodeURIComponent(location.href),
          state: "QRCODE",
          style: "black",
          href: "data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDEyNnB4O30NCi5pbXBvd2VyQm94IC50aXRsZSB7ZGlzcGxheTogbm9uZTt9DQouaW1wb3dlckJveCAuaW5mbyB7d2lkdGg6IDIwMHB4O30NCi5zdGF0dXNfaWNvbiB7ZGlzcGxheTogbm9uZX0NCi5pbXBvd2VyQm94IC5zdGF0dXMge3RleHQtYWxpZ246IGNlbnRlcjt9DQo=",
        });
    }, [showLoginQrcode]);

    return (
      <div className={clsx(className, styles.weixinLogin)}>
        <Spin spinning={isLoggingIn} tip="正在登录">
          {!isInWechatBrowser && showLoginQrcode && <div id="wxQrCode"></div>}
          {isInWechatBrowser && (
            <Button
              onClick={onLogin}
              type="primary"
              size="large"
              icon={<WechatOutlined />}
            >
              微信登录
            </Button>
          )}
          <Modal
            title="绑定手机"
            open={phoneBindModal}
            footer={null}
            onCancel={onBindCancel}
          >
            <PhoneBind
              onBindSuccess={onBindSuccess}
              onBindFailed={onBindFailed}
            />
          </Modal>
        </Spin>
      </div>
    );
  }
);

export default WeixinLogin;
