export const requestWechatAuthorize = (redirectUri: string) => {
  const authorizeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${
    process.env.NEXT_PUBLIC_WX_SERVICE_APPID
  }&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;

  return authorizeUrl;
};

export const requestWorkWechatAuthorize = (redirectUri: string) => {
  redirectUri = redirectUri.replace('localhost:8888', 'mtbird.staringos.com/test')
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.NEXT_PUBLIC_WORK_WX_STARING_AI_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_privateinfo&state=STATE#wechat_redirect`;
};

export const isWechat = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return /MicroMessenger/i.test(window.navigator.userAgent);
};

export const isWorkWechat = () => {
  if (typeof window === "undefined") {
    return false;
  }

  let userUa = navigator.userAgent.toLowerCase();
  // 是企业微信
  return userUa.indexOf("wxwork") > -1;
};

export const isMiniProgram = () => {
  return new Promise((resolve) => {
    const ua = navigator.userAgent.toLowerCase();
    // @ts-ignore
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
      const wx = require("weixin-js-sdk");
      console.log(wx)
      //ios的ua中无miniProgram，但都有MicroMessenger（表示是微信浏览器）
      wx?.miniProgram?.getEnv((res: any) => {
        resolve(!!res.miniprogram)
      });
    } else {
      resolve(false);
    }
  })
};