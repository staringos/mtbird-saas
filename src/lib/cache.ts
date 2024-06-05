import isNumber from "lodash/isNumber";
import redis from "./redis";

// cache from local
// const CACHE = {} as Record<string, any>
// export const EXPIRE_TIME = {} as Record<string, any>

// export const getItem = (key: string) => {
//   const expireTime = EXPIRE_TIME[key]
//   // if expire, return empty
//   if (expireTime && expireTime < new Date().getTime()) {
//     return undefined
//   }
//   return CACHE[key]
// }

// export const setItem = (key: string, value: any, time?: number) => {
//   CACHE[key] = value

//   if (time) {
//     EXPIRE_TIME[key] = new Date().getTime() + time
//   }
// }

export const KEY_WECHAT_JSSDK_TICKET = "KEY_WECHAT_JSSDK_TICKET";
export const KEY_WECHAT_TICKET = "KEY_WECHAT_TICKET";
export const KEY_WECHAT_ACCESS_TOKEN = "KEY_WECHAT_ACCESS_TOKEN";
export const KEY_WECHAT_3RD_API_ACCESS_TOKEN =
  "KEY_WECHAT_3RD_PLATFORM_ACCESS_TOKEN"; // 微信 第三方平台接口 accessToken
export const KEY_WECHAT_MP_API_ACCESS_TOKEN = "KEY_WECHAT_MP_API_ACCESS_TOKEN"; // 微信 小程序接口 accessToken
export const KEY_WECHAT_MP_API_REFRESH_TOKEN =
  "KEY_WECHAT_MP_API_REFRESH_TOKEN"; // 微信 小程序接口 accessToken

// 企业微信定期推送的ticket
export const WORK_WECHAT_SUITE_TICKET_KEY = 'WORK_WECHAT_SUITE_TICKET';
//第三方应用凭证（suite_access_token）。
export const WORK_WECHAT_SUITE_ACCESS_TOKEN = 'WORK_WECHAT_SUITE_ACCESS_TOKEN';

export const getOfficialAccountScanKey = (id: string) => {
  return `officialAccount:${id}:login`
}

export const getUserAccessIdentifierKey = (userId: string) => {
  return `user:${userId}:accessIdentifier`
}

export const getUserPlatformAccessIdentifierKey = (userId: string) => {
  return `user:${userId}:platform:accessIdentifier`
}

export const getWorkWechatCorpAccessTokenKey = (corpId: string) => {
  return `workWechat:${corpId}:accessToken`
}

// cache to redis
export const getItem = (key: string) => {
  return redis?.get(key) as any;
};

export const setItem = (key: string, value: any, time?: number) => {
  const options: Record<string, any> = {};

  if (time && isNumber(time)) {
    options.EX = time;
  }
  console.log("setItem:", key, options);

  redis?.set(key, value, options);
  // if (time && isNumber(time)) {
  //   console.log("expire:", key, time);
  //   return redis.expireat(key, time);
  // }
};
