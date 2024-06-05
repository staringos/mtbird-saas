import React, { useEffect, useState } from "react";
import { Button, Avatar, Spin, Alert } from "antd";
import { observer } from "mobx-react-lite";
import { useStore } from "store";

import { getUserWechatInfo } from "apis/wx";
import { generateKeys } from "@mtbird/core";
import { AUTH_TOKEN } from "../../utils/constants";
import { urlencode } from "../../utils";

interface IProps {
  onSuccess?: () => void;
}

const BindWechat = observer(({ onSuccess }: IProps) => {
  const { userInfo, setUserWxInfo } = useStore();
  const [bindInterval, setBindInterval] = useState<
    ReturnType<typeof setInterval> | undefined
  >();
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [bindSuccess, setBindSuccess] = useState<boolean | string>(false);

  useEffect(() => {
    return () => {
      if (bindInterval) clearInterval(bindInterval);
    };
  }, []);

  const handleBindWx = () => {
    if (bindInterval) return;
    const loginKey = generateKeys();
    const ak = localStorage.getItem(AUTH_TOKEN);
    const redirectUri = urlencode(
      `https://mtbird.staringos.com/api/wx/login/callback`
    );
    window.open(
      `https://open.weixin.qq.com/connect/qrconnect?appid=${
        process.env.NEXT_PUBLIC_WX_WEBSITE_APPID
      }&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${
        loginKey + "@" + ak
      }#wechat_redirect`
    );
    // window.open(`https://open.weixin.qq.com/connect/qrconnect?appid=wxa692729034d99a33&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`)
    setLoading("请使用微信扫描二维码...");

    const interval = setInterval(async () => {
      const res = await getUserWechatInfo(loginKey);
      if (res.data) {
        setUserWxInfo(res.data);
        clearInterval(interval);
        setBindInterval(undefined);
        setLoading(undefined);
        setBindSuccess("微信绑定成功!");
        onSuccess && onSuccess();
      }
    }, 3 * 1000);

    setBindInterval(interval);
  };

  return (
    <Spin tip={loading} spinning={!!loading}>
      {bindSuccess && (
        <Alert
          style={{ marginBottom: 10 }}
          message="微信绑定成功！"
          type="success"
          showIcon
        />
      )}
      {userInfo?.wxInfo ? (
        <div>
          <Avatar src={userInfo.wxInfo.headImage} size="small"></Avatar>
          <span style={{ marginLeft: 10 }}>{userInfo.wxInfo.nickname}</span>
          <Button type="link" size="small" onClick={handleBindWx}>
            重新绑定
          </Button>
        </div>
      ) : (
        <Button onClick={handleBindWx}>点击扫码绑定微信</Button>
      )}
    </Spin>
  );
});

export default BindWechat;
