import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Spin, message } from "antd";
import clsx from "@/utils/clsx";
import { getRegistryInfoFromQuery, isMobile as isMobileDevice } from "utils";
import { useStore } from "store";
import { isMiniProgram } from "@/utils/weixin";
import { observer } from "mobx-react-lite";
import { WechatOutlined } from "@ant-design/icons";
import styles from "./style.module.less";

interface IProps {
  to: string;
  appId?: string;
  redirectUrl?: any;
  query?: Record<any, string>;
  className?: string;
}

const MPLogin = observer(
  ({ to, appId, redirectUrl, query, className }: IProps) => {
    const store = useStore();
    const [phoneBindModal, setPhoneBindModal] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [currentToken, setCurrentToken] = useState(false);

    // url?mpLogin=1 正在请求授权
    // url?mpLogin=2&mpCode=${code} 请求授权完成
    const login = () => {
      isMiniProgram().then(isMP => {
        if (!isMP) return;
        const url = new URL(location.href);
        if (url.searchParams.get('mpLogin')) return;

        url.searchParams.set('mpLogin', '1');
        location.href = url.toString();
      });
    }

    useEffect(() => {
      // login();
    }, []);

    const init = async () => {
      const url = new URL(location.href);
      const mpCode = url.searchParams.get('mpCode')
      console.log(mpCode)
      if (!mpCode) return;

      if (mpCode) {
        const result = await store.miniProgramAuthorize(
          mpCode,
          to,
          appId!,
          getRegistryInfoFromQuery(query!) as any,
        );

        store.afterLogin(to, redirectUrl, result.token);
      }
    }

    useEffect(() => {
      init();
    }, [appId, query, redirectUrl, store, to])

    const onLogin = () => {
      login();
    };

    return (
      <div className={clsx(className, styles.weixinLogin)}>
        <Spin spinning={isLoggingIn} tip="正在登录">
          <Button
            onClick={onLogin}
            type="primary"
            size="large"
            icon={<WechatOutlined />}
          >
            点击登录
          </Button>
        </Spin>
      </div>
    );
  }
);

export default MPLogin;
