import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, QRCode, Spin, message } from "antd";
import clsx from "@/utils/clsx";
import { observer } from "mobx-react-lite";
import { checkLogin, getGZHQrcode } from "../../apis/wx";
import { useStore } from "store";

import styles from "./style.module.less";
import { getRegistryInfoFromQuery } from "../../utils";
import { AUTH_TOKEN } from "../../utils/constants";

interface IProps {
  to: string;
  appId?: string;
  redirectUrl?: any;
  query?: Record<any, string>;
  className?: string;
}

const WeixinGZHLogin = observer(
  ({ to, appId, redirectUrl, query, className }: IProps) => {
    const store = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [qrcodeInfo, setQrcodeInfo] = useState<{
      expire: number;
      url: string;
      scene: any;
      key: string;
    }>();

    useEffect(() => {
      getGZHQrcode({
        to,
        registryInfo: query && getRegistryInfoFromQuery(query),
      })
        .then((res) => {
          console.log(res);
          if (res.code === 200) {
            setQrcodeInfo(res.data);
          } else {
            message.error("获取异常，请稍后再试或尝试其他登录方式");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [query, to]);

    useEffect(() => {
      let timer;
      if (qrcodeInfo?.key) {
        timer = setInterval(() => {
          checkLogin(qrcodeInfo.key).then((res) => {
            if (res.code === 200 && res.data?.token) {
              localStorage.setItem(AUTH_TOKEN, res.data.token as string);
              store.afterLogin(to, redirectUrl, res.data.token);
            }
          });
        }, 1000);
      }

      return () => {
        return clearInterval(timer);
      };
    }, [qrcodeInfo?.key, redirectUrl, store, to]);

    return (
      <div className={clsx(className, styles.weixinLogin)}>
        <QRCode
          value={qrcodeInfo?.url || "-"}
          size={136}
          status={isLoading ? "loading" : "active"}
        />
        <p className={styles.tip}>请使用微信扫描二维码</p>
        {/* {!isInWechatBrowser && showLoginQrcode && <div id="wxQrCode"></div>}
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
          </Modal> */}
      </div>
    );
  }
);

export default WeixinGZHLogin;
