import React, { useEffect, useState } from "react";
import { Button, Modal, Spin, message } from "antd";
import clsx from "@/utils/clsx";
import { requestWorkWechatAuthorize } from "@/utils/weixin";
import { useStore } from "store";
import { observer } from "mobx-react-lite";
import { WechatOutlined } from "@ant-design/icons";
import PhoneBind from "components/PhoneBind";
import { isWorkWechat } from "@/utils/weixin";
import { getRegistryInfoFromQuery } from "utils";
import styles from "./style.module.less";

interface IProps {
  to: string;
  appId?: string;
  redirectUrl?: any;
  query?: Record<any, string>;
  className?: string;
}

const WorkWeixinLogin = observer(
  ({ to, appId, redirectUrl, query, className }: IProps) => {
    const store = useStore();
    const [phoneBindModal, setPhoneBindModal] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [currentToken, setCurrentToken] = useState(false);


    const onLogin = () => {
      const url = requestWorkWechatAuthorize(location.href);
      console.log(url);
      // return;
      location.href = url;
    };

    useEffect(() => {
      // 企业微信环境下直接调登录
      if (isWorkWechat()) {
        const search = new URL(location.href).searchParams
        if (!search.get('code') && !search.get('state')) {
          onLogin()
        }
      }
    }, [])


    const resetUrl = () => {
      const url = new URL(location.href)
      url.searchParams.delete('code');
      url.searchParams.delete('state');

      history.replaceState(null, '', url.toString());
    }

    const requestAuthorize = async () => {
      if (!query?.code || !query?.state) {
        return;
      }
      const { code, state } = query;

      try {
        setIsLoggingIn(true);

        const result = await store.workWeixinAuthorize(
          code,
          to,
          appId,
          state,
          getRegistryInfoFromQuery(query)
        );

        setCurrentToken(result.token);
        resetUrl();
     
        store.afterLogin(to, redirectUrl, result.token);
        setTimeout(() => setIsLoggingIn(false), 500)
      } catch (error) {
        console.log(error)
        setIsLoggingIn(false);
        message.error(error.msg || "微信登录失败，请稍后重试");
      }
    };

    const onBindCancel = () => {
      localStorage.setItem('cancel_bind_phone', '1');
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

    return (
      <div className={clsx(className, styles.weixinLogin)}>
        <Spin spinning={isLoggingIn} tip="正在登录">
          <Button
            onClick={onLogin}
            type="primary"
            size="large"
            icon={<WechatOutlined />}
            style={{
              backgroundColor: "#3a65b3"
            }}
          >
            企业微信登录
          </Button>
          <Modal title="绑定手机" open={phoneBindModal} footer={null} onCancel={onBindCancel}>
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

export default WorkWeixinLogin;
