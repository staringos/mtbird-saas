import prisma from "../prisma";
import {
  getItem,
  KEY_WECHAT_3RD_API_ACCESS_TOKEN,
  KEY_WECHAT_JSSDK_TICKET,
  KEY_WECHAT_MP_API_ACCESS_TOKEN,
  KEY_WECHAT_MP_API_REFRESH_TOKEN,
  KEY_WECHAT_TICKET,
  setItem,
} from "lib/cache";
import isNumber from "lodash/isNumber";
import { generateWxExtJson, urlencode } from "@/utils/index";
import { generateKeys } from "@mtbird/core";
import { uploadImage } from "lib/controllers/upload";
import { NextApiRequest, NextApiResponse } from "next";
import { getFromBody, getFromQuery, saveResponseBodyAsFile } from "lib/utils";
import { generateResponse } from "lib/response";
import {
  PARAMS_ERROR,
  RESOURCE_NOT_FIND,
  SET_NAME_ERROR_CODE,
} from "@/utils/messages";
import { appCheck } from "./app";
import { WX_VERIFY_MP_CALLBACK_ERROR } from "@/utils/constants";
import { IApplication } from "@/types/entities/Application";
import unionWith from "lodash/unionWith";
import { IMiniProgramDto } from "@/types/entities/Wx";
import { register } from "./auth";

// const sha1 = require('sha1')
const crypto = require("crypto");
const request = require("request");
const fs = require("fs");
const path = require("path");

export const getSignature = (
  ticket: string,
  noncestr: string,
  timestamp: number,
  url: string
) => {
  var shasum = crypto.createHash("sha1");
  shasum.update(
    "jsapi_ticket=" +
      ticket +
      "&noncestr=" +
      noncestr +
      "&timestamp=" +
      timestamp +
      "&url=" +
      url
  );
  return shasum.digest("hex");
};

export const getCacheTicket = async () =>  {
  let ticket: any = await getItem(KEY_WECHAT_JSSDK_TICKET);

  if (!ticket) {
    ticket = await getTicket();
    setItem(KEY_WECHAT_JSSDK_TICKET, ticket, 2000);
  }
  return ticket;
}

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 第一步，通过appId和appSecret 获取access_token
    request(
      `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/token?grant_type=client_credential&appid=${process.env.WX_APP_ID}&secret=${process.env.WX_SECRET}`,
      function (error: any, response: any, body: any) {
        if (!error && response.statusCode == 200) {
          let access_token = JSON.parse(body).access_token;
          resolve(access_token as string);
        } else {
          reject(error);
        }
      }
    );
  });

}

export const getTicket = () => {
  const promise = getAccessToken();

  return promise.then((access_token) => {
    // 第二步，通过第一步的access_token获取票据ticket
    return new Promise((resolve, reject) => {
      request(
        `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`,
        function (error: any, response: any, body: any) {
          if (!error && response.statusCode == 200) {
            let ticket = JSON.parse(body).ticket;
            resolve(ticket);
          } else {
            reject(error);
          }
        }
      );
    });
  });
};

export const getLoginAccessToken = (code: string) => {
  return new Promise((resolve, reject) => {
    request(
      `${process.env.NEXT_PUBLIC_WX_API_URL}/sns/oauth2/access_token?appid=${process.env.WX_WEBSITE_APPID}&secret=${process.env.WX_WEBSITE_SECRET}&code=${code}&grant_type=authorization_code`,
      function (error: any, response: any, body: any) {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      }
    );
  });
};

export const jscode2session = (code: string) => {
  return new Promise((resolve, reject) => {
    request(
      `${process.env.NEXT_PUBLIC_WX_API_URL}/sns/jscode2session?appid=${process.env.NEXT_PUBLIC_STARING_AI_APPID}&secret=${process.env.STARING_AI_SECRET}&js_code=${code}&grant_type=authorization_code`,
      function (error: any, response: any, body: any) {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      }
    );
  });
};

export const getLoginAccessToken2 = (code: string) => {
  return new Promise((resolve, reject) => {
    request(
      `${process.env.NEXT_PUBLIC_WX_API_URL}/sns/oauth2/access_token?appid=${process.env.WX_SERVICE_APPID}&secret=${process.env.WX_SERVICE_SECRET}&code=${code}&grant_type=authorization_code`,
      function (error: any, response: any, body: any) {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      }
    );
  });
};

export const getWechatUserInfo = (
  accessToken: string,
  openId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    request(
      `${process.env.NEXT_PUBLIC_WX_API_URL}/sns/userinfo?access_token=${accessToken}&openid=${openId}`,
      function (error: any, response: any, body: any) {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      }
    );
  });
};

export const getWechatUserBaseInfo = (
  accessToken: string,
  openId: string
) => {
  return new Promise((resolve, reject) => {
    request(
      `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/user/info?access_token=${accessToken}&openid=${openId}`,
      function (error: any, response: any, body: any) {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body));
        } else {
          reject(error);
        }
      }
    );
  });
}

export const createQrcode = (
  accessToken: string,
  scene: any,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/qrcode/create?access_token=${accessToken}`,
      json: true,
      body: {
        expire_seconds: 600, // 过期时间 单位秒
        action_name: 'QR_STR_SCENE',
        action_info: {
          scene: {
            scene_str: JSON.stringify(scene),
          }
        }
      }
    }, function (error: any, response: any, body: any) {
      console.log("createQrcode", error, response, body)
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    })
  });
};


/**
 * 第三方平台接口的调用凭据
 * https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_access_token.html
 * @returns
 */
export const get3rdAccessToken = async () => {
  const accessToken3rd = await getItem(KEY_WECHAT_3RD_API_ACCESS_TOKEN);
  console.log("[get3rdAccessToken] accessToken3rd:", accessToken3rd);
  if (accessToken3rd) return accessToken3rd;
  console.log("[get3rdAccessToken] after accessToken3rd:", accessToken3rd);

  const ticket = await getItem(KEY_WECHAT_TICKET);

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/component/api_component_token`,
        json: true,
        body: {
          component_appid: process.env.WX_OPEN_APPID,
          component_appsecret: process.env.WX_OPEN_SECRET,
          component_verify_ticket: ticket,
        },
      },
      function (error: any, response: any, body: any) {
        console.log("OOOOOZqaOAT:", body);
        if (!error && response.statusCode == 200 && !body.errcode) {
          let at = body.component_access_token;

          // expires faster for network delay
          setItem(
            KEY_WECHAT_3RD_API_ACCESS_TOKEN,
            at,
            isNumber(body.expires_in) ? body.expires_in - 1000 : 6000
          );
          resolve(at);
        } else {
          reject(body);
        }
      }
    );
  });
};

export const fastRegisterBetaMP = (
  accessToken: string,
  name: string,
  openId: string
) => {
  return new Promise((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/component/fastregisterbetaweapp`;
    const query = {
      name: name + "mtbird",
      openid: openId,
    };

    request.post(
      {
        url,
        qs: {
          access_token: accessToken,
        },
        body: query,
        json: true,
      },
      function (error: any, response: any, body: any) {
        console.log("error:", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const saveBetaMPRegister = async (
  registerRes: Record<string, any>,
  appId: string,
  wxMpTemplateId?: string
) => {
  let miniProgram = await prisma.wxMiniProgram.findFirst({
    where: {
      appId,
    },
  });

  if (miniProgram) {
    miniProgram = await prisma.wxMiniProgram.update({
      where: {
        id: miniProgram.id,
      },
      data: {
        authorizeUrl: registerRes.authorize_url,
        wxUniqueId: registerRes.unique_id,
      },
    });
  } else {
    miniProgram = await prisma.wxMiniProgram.create({
      data: {
        appId,
        wxMpTemplateId,
        authorizeUrl: registerRes.authorize_url as string,
        wxUniqueId: registerRes.unique_id as string,
      },
    });
  }

  return miniProgram;
};

export const fastRegisterBetaMPCallback = async (
  formatData: Record<string, any>
) => {
  console.log(
    "[1] Enter authed callback:",
    formatData.info,
    formatData.info?.unique_id
  );
  let miniProgram = await prisma.wxMiniProgram.findFirst({
    where: {
      wxUniqueId: formatData.info.unique_id as string,
    },
  });
  console.log("[1.1] Query result:", miniProgram);

  if (!miniProgram)
    return console.error("收到未记录的试用小程序回调:", miniProgram, {
      name: formatData.info.name,
      wxAppId: formatData.appId,
      status: "registedBeta",
    });

  try {
    // 1. update authorization status
    const newMiniProgram = await prisma.wxMiniProgram.update({
      where: {
        wxUniqueId: formatData.info.unique_id as string,
      },
      data: {
        name: formatData.info.name,
        wxAppId: formatData.appid,
        status: "registedBeta",
      },
    });

    console.log("[2] Update authed status success:", newMiniProgram);
  } catch (e) {
    console.log("[2.ERROR] :", e);
  }

  // 2. upload code
  await commitCodeToMP(
    miniProgram.appId as string,
    formatData.appid,
    miniProgram.wxMpTemplateId as string
  );

  // 3. generate qrcode
  await generateQRCode(miniProgram.id, formatData.appid);
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/beta_Mini_Programs/fastverify.html
export const betaMPVerifyCallback = async (formatData: Record<string, any>) => {
  const mp = await prisma.wxMiniProgram.findFirst({
    where: {
      wxAppId: formatData.appid,
    },
  });

  if (!mp)
    return console.log("[betaMPVerifyCallback] app id not find:", formatData);

  if (formatData.status === "0") {
    await prisma.wxMiniProgram.update({
      data: {
        status: "release",
        type: "release",
        verifyStatus: "",
        verifyMessage: "",
      },
      where: {
        id: mp.id,
      },
    });
  } else {
    console.log("[betaMPVerifyCallback] status not 0:", formatData);
    await prisma.wxMiniProgram.update({
      data: {
        verifyStatus: formatData.status,
        verifyMessage:
          WX_VERIFY_MP_CALLBACK_ERROR[formatData.status as any] || "",
      },
      where: {
        id: mp.id,
      },
    });
  }
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/wxa_nickname_audit.html
export const setMpNicknameCallback = async (
  formatData: Record<string, any>
) => {
  // TODO 当名称需要审核的时候，处理这个callback，目前无需处理
  // const
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorization_info.html
export const queryMPAuth = async (authorizationCode: string) => {
  const ak3rd = await get3rdAccessToken();
  const data = {
    url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/component/api_query_auth?component_access_token=${ak3rd}`,
    json: true,
    body: {
      component_appid: process.env.WX_OPEN_APPID,
      authorization_code: authorizationCode,
    },
  };

  console.log("[queryMPAuth] request:", data);

  return new Promise((resolve, reject) => {
    request.post(data, function (error: any, response: any, body: any) {
      console.log("[queryMPAuth] error:", error, body, authorizationCode);
      if (
        !error &&
        response.statusCode == 200 &&
        (!body.errcode || body.errcode === 0)
      ) {
        const accessToken = body.authorization_info.authorizer_access_token;
        const refreshToken = body.authorization_info.authorizer_refresh_token;
        // const cacheKey = KEY_WECHAT_MP_API_ACCESS_TOKEN + customerAppId
        // const refreshKey = KEY_WECHAT_MP_API_REFRESH_TOKEN + customerAppId

        resolve({
          accessToken,
          refreshToken,
          expireTime: body.authorization_info.expires_in,
        });
      } else {
        reject(error);
      }
    });
  });
};

/**
 * 获取客户小程序接口调用 AccessToken
 * https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_authorizer_token.html
 */
export const getCustomerMPAPIAccessToken = async (
  accessToken3rd: string,
  customerAppId: string
) => {
  const cacheKey = KEY_WECHAT_MP_API_ACCESS_TOKEN + customerAppId;
  const customerAccessToken = await getItem(cacheKey);

  console.log(
    "[getCustomerMPAPIAccessToken 1] customerAccessToken:",
    customerAccessToken
  );
  if (customerAccessToken) return customerAccessToken;

  const refreshKey = KEY_WECHAT_MP_API_REFRESH_TOKEN + customerAppId;
  let refreshToken = await getItem(refreshKey);
  console.log("[getCustomerMPAPIAccessToken 2] refreshToken:", refreshToken);

  // 如果 refreshToken 都没有，直接重新请求
  if (!refreshToken) {
    const wxAuth = await prisma.wxMiniProgramAuthorization.findFirst({
      where: {
        wxAppId: customerAppId,
      },
    });
    console.log("[getCustomerMPAPIAccessToken 3] wxAuth:", wxAuth);

    if (!wxAuth) throw new Error("小程序未授权!");

    try {
      const { accessToken, refreshToken, expireTime } = (await queryMPAuth(
        wxAuth.authorizationCode as string
      )) as any;
      const expire = expireTime - 1000;
      setItem(cacheKey, accessToken, expire);
      setItem(refreshKey, refreshToken);
      return accessToken;
    } catch (e) {
      console.log("e:", e);
    }
    return null;
  }

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/component/api_authorizer_token?component_access_token=${accessToken3rd}`,
        json: true,
        body: {
          component_appid: process.env.WX_OPEN_APPID,
          authorizer_appid: customerAppId,
          authorizer_refresh_token: refreshToken,
        },
      },
      function (error: any, response: any, body: any) {
        console.log("[getCustomerMPAPIAccessToken 2] callback:", error, body);

        if (!error && response.statusCode == 200 && !body.errcode) {
          console.log("[getCustomerMPAPIAccessToken 3] body:", body);
          const at = body.authorizer_access_token;

          // expires faster for network delay
          setItem(
            cacheKey,
            at,
            isNumber(body.expires_in) ? body.expires_in - 1000 : 5000
          );
          resolve(at);
        } else {
          reject(error);
        }
      }
    );
  });
};

/**
 * 上传小程序代码并生成体验版
 * https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/commit.html
 */
export const mpCommitCode = (
  accessToken: string,
  appId: string,
  wxAppId: string,
  wxMpTemplateId: string = "0"
): Promise<any> => {
  const params = {
    url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/commit?access_token=${accessToken}`,
    json: true,
    body: {
      template_id: wxMpTemplateId,
      ext_json: JSON.stringify(generateWxExtJson(appId, wxAppId)),
      user_version: "v1.0",
      user_desc: "test",
    },
  };

  console.log(
    "[mpCommitCode] wxMpTemplateId aaw:",
    accessToken,
    appId,
    wxAppId,
    params,
    wxMpTemplateId,
    generateWxExtJson(appId, wxAppId)
  );
  return new Promise((resolve, reject) => {
    request.post(params, function (error: any, response: any, body: any) {
      if (!error && response.statusCode == 200) {
        console.log("[mpCommitCode] body:", error, body);
        resolve(body);
      } else {
        console.log("[mpCommitCode] error:", error, body);
        reject(error);
      }
    });
  });
};

// combine to get qrcode from wechat api to qiniu cdn
export const generateQRCode = async (
  wxMpId: string,
  customerAppId: string,
  isOffical = false
) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );
  const { path, name } = (
    isOffical
      ? await getMPOfficalQRCode(accessTokenCustomerMP)
      : await getMPTestQRCode(accessTokenCustomerMP)
  ) as { path: string; name: string };
  console.log("[generateQRCode] path:", path);
  if (!path) return;
  const url = await uploadImage(path, name);

  // update qrcode url
  await prisma.wxMiniProgram.update({
    where: {
      id: wxMpId,
    },
    data: {
      [isOffical ? "officalQrcodeUrl" : "qrcodeUrl"]: url as string,
    },
  });
  return url;
};

// 获取体验版小程序二维码
// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/get_qrcode.html
export const getMPTestQRCode = async (accessToken: string, mpPath?: string) => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `${
          process.env.NEXT_PUBLIC_WX_API_URL
        }/wxa/get_qrcode?access_token=${accessToken}&path=${urlencode(
          mpPath || "pages/index/index"
        )}`,
        encoding: "binary",
      },
      async (error: any, response: any, body: any) => {
        if (!error && response.statusCode == 200 && !body.errcode) {
          const name = generateKeys() + ".jpg";
          const basePath = path.resolve("./.mtbird-cache");
          const filePath = `${basePath}/${name}`;

          await saveResponseBodyAsFile(basePath, filePath, body);

          resolve({
            path: filePath,
            name,
            size: response.headers["Content-Length"],
          });
        } else {
          reject(error);
        }
      }
    );
  });
};

// 获取正式版小程序二维码
// https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/qr-code/getQRCode.html
export const getMPOfficalQRCode = async (
  accessToken: string,
  mpPath?: string
) => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/getwxacode?access_token=${accessToken}`,
        encoding: "binary",
        json: true,
        body: {
          path: mpPath || "pages/index/index",
        },
      },
      async (error: any, response: any, body: any) => {
        if (!error && response.statusCode == 200 && !body.errcode) {
          const name = generateKeys() + ".jpg";
          const basePath = path.resolve("./.mtbird-cache");
          const filePath = `${basePath}/${name}`;

          await saveResponseBodyAsFile(basePath, filePath, body);

          resolve({
            path: filePath,
            name,
            size: response.headers["Content-Length"],
          });
        } else {
          reject(error);
        }
      }
    );
  });
};

export const commitCodeToMP = async (
  appId: string,
  customerAppId: string,
  wxMpTemplateId: string = "0"
) => {
  if (!customerAppId) return null;

  const accessToken3rd = await get3rdAccessToken();

  console.log("[commitCodeToMP 1]:", accessToken3rd, customerAppId);

  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  console.log(
    "[3. prepare access token]:",
    accessToken3rd,
    accessTokenCustomerMP
  );

  const res = await mpCommitCode(
    accessTokenCustomerMP,
    appId,
    customerAppId,
    wxMpTemplateId
  );

  console.log("[4. upload code]:", res);

  const wxMini = await prisma.wxMiniProgram.findFirst({
    where: {
      appId,
    },
  });

  if (!wxMini) return false;
  if (res.errcode !== 0)
    return console.error("Code Upload Error:", res.errcode, res.error_msg);

  const wxMp = await prisma.wxMiniProgram.update({
    where: {
      id: wxMini.id as string,
    },
    data: {
      status: "pushedBeta",
    },
  });

  console.log("[4. MP state success]:", wxMp);

  return wxMp;
};

/**
 * 小程序授权变更通知回调
 * https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorize_event.html
 */
export const authedMPCallback = async (formData: any) => {
  const wxAuth = await prisma.wxMiniProgramAuthorization.findFirst({
    where: {
      wxAppId: formData.AuthorizerAppid,
    },
  });

  const data = {
    authorizationCode: formData.AuthorizationCode,
    authorizationCreateTime: formData.CreateTime,
    authorizationCodeExpiredTime: formData.AuthorizationCodeExpiredTime,
    preAuthCode: formData.PreAuthCode,
  };

  console.log("[authedMPCallback] data:", data, wxAuth);

  try {
    if (wxAuth) {
      return await prisma.wxMiniProgramAuthorization.update({
        where: {
          id: wxAuth.id,
        },
        data,
      });
    }

    console.log("[authedMPCallback] new:", data, wxAuth);

    const res = await prisma.wxMiniProgramAuthorization.create({
      data: {
        ...data,
        wxAppId: formData.AuthorizerAppid,
      },
    });

    console.log("[authedMPCallback] res:", res);
  } catch (e: any) {
    console.log("[authedMPCallback] e:", e, e.message);
  }
};

const domains = [
  "https://mtbird.staringos.com",
  "https://cdn.staringos.com",
  "https://mtbird-cdn.staringos.com",
  "https://registry.staringos.com",
  "https://ai.staringos.com",
  "https://staringai.com",
  "https://upload-z2.qiniup.com",
  "https://upload-z1.qiniup.com",
  "https://api.ai.staringos.com",
  "https://hmma.baidu.com",
  "https://api-dev.cenmetahome.cn"
];

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/Server_Address_Configuration.html
export const setApiDomain = async (wmpId: string, customerAppId: string) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/modify_domain?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {
          action: "add",
          requestdomain: domains,
          uploaddomain: domains,
          downloaddomain: domains,
        },
      },
      async (error: any, response: any, body: any) => {
        console.log("[setMPDomain] body:", error, body);
        if (!error && response.statusCode == 200) {
          await prisma.wxMiniProgram.update({
            where: {
              id: wmpId,
            },
            data: {
              domains: domains.join(","),
            },
          });
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/domain/modify_jump_domain.html
// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/setwebviewdomain.html
export const setMPDomain = async (wmpId: string, customerAppId: string) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/setwebviewdomain?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {
          action: "add",
          webviewdomain: domains,
        },
      },
      async (error: any, response: any, body: any) => {
        console.log("[setMPDomain] body:", error, body);
        if (!error && response.statusCode == 200) {
          await prisma.wxMiniProgram.update({
            where: {
              id: wmpId,
            },
            data: {
              domains: domains.join(","),
            },
          });
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const mpCheck = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  outsideApp?: IApplication
) => {
  const appId = getFromQuery(req, "appId") as string;
  if (!appId) {
    res.status(400).send(generateResponse(400, PARAMS_ERROR));
    return false;
  }

  // 有 app 操作权限
  const app = outsideApp || (await appCheck(res, appId, userId));

  if (!app) {
    res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
    return false;
  }

  const wxMp = await prisma.wxMiniProgram.findFirst({
    where: {
      appId,
    },
  });

  if (!wxMp) {
    res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
    return false;
  }

  return wxMp;
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/beta_Mini_Programs/fastverify.html
export const verifyBetaMPService = async (
  customerAppId: string,
  company: any
) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/verifybetaweapp?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {
          verify_info: {
            enterprise_name: company.name,
            code: company.code,
            code_type: company.codeType,
            legal_persona_wechat: company.legalPersonaWechat,
            legal_persona_name: company.legalPersonaName,
            component_phone: "18310734267",
            legal_persona_idcard: company.legalPersonaIdCard,
          },
        },
      },
      function (error: any, response: any, body: any) {
        console.log("[verifyBetaMPService] error:", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/setnickname.html
export const setMpName = async (
  name: string,
  license: string,
  customerAppId: string
) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/setnickname?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {
          nick_name: name,
          license,
        },
      },
      function (error: any, response: any, body: any) {
        console.log("[setMpName] error", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject({
            errMessage:
              SET_NAME_ERROR_CODE[body.errcode as any] || "设置小程序名称失败",
            ...body,
            ...error,
          });
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/openApi/OpenApiDoc/miniprogram-management/category-management/addCategory.html
export const addCategory = async (
  customerAppId: string,
  categories: Array<Record<string, any>>
) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  categories.map((cur) => {
    if (cur.certicates && cur.certicates.length > 0) {
      cur.certicates = cur.certicates.map((path: string, i: number) => {
        return {
          value: path,
          key: cur.qualify.exter_list[i],
        };
      });
    }
  });

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/wxopen/addcategory?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {
          categories: categories.map((cur) => ({
            first: cur.first_id,
            second: cur.second_id,
          })),
        },
      },
      function (error: any, response: any, body: any) {
        console.log("[addCategory] error", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/category/getallcategories.html
export const getAllMPCategory = async (customerAppId: string) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/wxopen/getallcategories?access_token=${accessTokenCustomerMP}`,
        json: true,
      },
      function (error: any, response: any, body: any) {
        console.log(
          "[getAllMPCategory] error",
          error,
          body.categories_list.categories.length
        );
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/category/get_category.html
export const getMPCategory = async (customerAppId: string) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/get_category?access_token=${accessTokenCustomerMP}`,
        json: true,
      },
      function (error: any, response: any, body: any) {
        console.log("[getMPCategory] error", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/submit_audit.html
export const submitAudit = async (
  itemList: any[],
  versionDesc: string,
  feedbackInfo: string,
  customerAppId: string
) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );
  const body = {
    item_list: unionWith(
      itemList,
      (a, b) => a.first_id === b.first_id && a.second_id === b.second_id
    ),
    version_desc: versionDesc,
    feedback_info: feedbackInfo,
  };
  console.log("[submitAudit] body:", body);

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/submit_audit?access_token=${accessTokenCustomerMP}`,
        json: true,
        body,
      },
      function (error: any, response: any, body: any) {
        console.log("[submitAudit] error:", error, body, itemList);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// 下载网络图片到 mtbird-cache 目录
export const downloadImageToCache = async (url: string, name: string) => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        url,
        encoding: "binary",
      },
      async (error: any, response: any, body: any) => {
        if (!error && response.statusCode == 200 && !body.errcode) {
          // const name = generateKeys() + '.jpg'
          const basePath = path.resolve("./.mtbird-cache");
          const filePath = `${basePath}/${name}`;

          if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath);
          }

          fs.writeFileSync(filePath, body, "binary", function (err: any) {
            console.log("fs err:", err);
          });

          resolve({
            path: filePath,
            name,
            size: response.headers["Content-Length"],
          });
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/New_temporary_materials.html
export const uploadMedia = async (
  customerAppId: string,
  type: "image" | "voice" | "video" | "thumb",
  filePath: string
) => {
  const accessToken3rd = await get3rdAccessToken();
  const at = await getCustomerMPAPIAccessToken(accessToken3rd, customerAppId);

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    const dots = filePath.split(".");
    const name = generateKeys() + "." + (dots[dots.length - 1] || "jpg");
    console.log("[uploadMedia] name", name, filePath);
    const resImage = (await downloadImageToCache(filePath, name)) as any;
    if (!resImage || !resImage.path) {
      throw new Error("图片下载失败，请重试!");
      return;
    }
    filePath = resImage.path;
    console.log("[uploadMedia] resImage", resImage);
  }

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/media/upload?access_token=${at}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        json: true,
        formData: {
          type,
          media: fs.createReadStream(filePath),
        },
      },
      function (error: any, response: any, body: any) {
        console.log("[uploadMedia] error:", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/modifyheadimage.html
export const modifyHeadImage = async (
  customerAppId: string,
  avatarUrl: string
) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  const mediaRes = (await uploadMedia(
    customerAppId,
    "image",
    avatarUrl
  )) as any;

  console.log("[modifyHeadImage] mediaRes:", mediaRes.media_id);

  if (!mediaRes.media_id) {
    throw new Error(mediaRes.errmsg);
    return;
  }

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/account/modifyheadimage?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {
          head_img_media_id: mediaRes.media_id,
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
        },
      },
      function (error: any, response: any, body: any) {
        console.log("[modifyHeadImage] error", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/openApi/OpenApiDoc/miniprogram-management/basic-info-management/setSignature.html
export const modifySignature = async (
  customerAppId: string,
  signature: string
) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/cgi-bin/account/modifysignature?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {
          signature,
        },
      },
      function (error: any, response: any, body: any) {
        console.log("[modifySignature] error", error, body, signature);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/get_latest_auditstatus.html
export const getLatestAuditStatus = async (customerAppId: string) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/get_latest_auditstatus?access_token=${accessTokenCustomerMP}`,
        json: true,
      },
      function (error: any, response: any, body: any) {
        console.log("[getLatestAuditStatus] error", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const refreshAudit = async (wxMp: any) => {
  const result = (await getLatestAuditStatus(wxMp.wxAppId)) as any;
  if (result.errcode === 0) {
    await mpAuditSuccess(wxMp, result);
  }
  return result;
};

export const mpAuditSuccess = async (
  wxMp: IMiniProgramDto,
  auditResult: any
) => {
  if (auditResult.status === 0) {
    // 生成正式版二维码
    await generateQRCode(wxMp.id, wxMp.wxAppId, true);
    // 发布小程序
    await mpRelease(wxMp.wxAppId);
  }

  // 更新信息
  await prisma.wxMiniProgram.update({
    where: {
      id: wxMp.id,
    },
    data: {
      status: auditResult.status === 0 ? "audited" : "auditing",
      auditId: auditResult.auditid + "",
      auditStatus: auditResult.status + "",
      auditScreenShot: auditResult.ScreenShot,
    },
  });
};

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/release.html
export const mpRelease = async (customerAppId: string) => {
  const accessToken3rd = await get3rdAccessToken();
  const accessTokenCustomerMP = await getCustomerMPAPIAccessToken(
    accessToken3rd,
    customerAppId
  );

  return new Promise((resolve, reject) => {
    request.post(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/wxa/release?access_token=${accessTokenCustomerMP}`,
        json: true,
        body: {},
      },
      function (error: any, response: any, body: any) {
        console.log("[mpRelease] error", error, body);
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

// 小程序登录
// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/others/WeChat_login.html
export const mpLogin = async (customerAppId: string, code: string) => {
  const accessToken3rd = await get3rdAccessToken();

  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `${process.env.NEXT_PUBLIC_WX_API_URL}/sns/component/jscode2session`,
        json: true,
        qs: {
          appid: customerAppId,
          component_appid: process.env.WX_OPEN_APPID,
          component_access_token: accessToken3rd,
          js_code: code,
          grant_type: "authorization_code",
        },
      },
      function (error: any, response: any, body: any) {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const findWechatUserInfo = async (unionId: string) => {
  return await prisma.userWechatInfo.findFirst({
    where: {
      unionId: unionId,
    },
    include: {
      user: {
        include: {
          Team: true,
        },
      },
    },
  });
}

export const findOrCreateMtbirdUserByWechatUser = async (
  userInfo: any,
  registeredIp: NextApiRequest | string,
  to: string | { tag?: string, way?: string },
  registryInfo: any,
  asResult: {
    openid: string;
    mpOpenid?: string;
    access_token?: string;
    refresh_token?: string;
  },
  state: string = 'STATE'
) => {
  if (!userInfo.unionid) return;
  const userWechatInfo = await findWechatUserInfo(userInfo.unionid);
  
  let mtbirdUser = null;

  if (userWechatInfo) {
    mtbirdUser = userWechatInfo.user;
  } else {
    const mtbirdUserInfo = await register(
      registeredIp,
      {
        nickname: userInfo.nickname,
      },
      to,
      registryInfo
    );

    mtbirdUser = mtbirdUserInfo;

    const newWechatInfo = {
      openId: asResult.openid,
      mpOpenid: asResult.mpOpenid,
      accessToken: asResult.access_token,
      refreshToken: asResult.refresh_token,
      nickname: userInfo.nickname,
      sex: userInfo.sex,
      province: userInfo.province,
      city: userInfo.city,
      country: userInfo.country,
      headImage: userInfo.headimgurl,
      privilege: userInfo.privilege,
      unionId: userInfo.unionid,
      state,
    };

    await prisma.userWechatInfo.create({
      data: {
        ...newWechatInfo,
        userId: mtbirdUserInfo.id,
      },
    });
  }

  !mtbirdUser &&
    console.error("WeChat registration failed", mtbirdUser, userWechatInfo);
  return mtbirdUser;
};
