import {
  ADMIN_HAS_TO_MANY_MP,
  APP_AVATAE_NOT_SETUP,
  APP_DESC_NOT_SETUP,
  APP_NAME_NOT_SETUP,
  BIND_WX_FIRST,
  MP_NOT_EXISTS,
  OPERATION_SUCCESS,
  PARAMS_ERROR,
  PARAMS_NEEDED,
  RESOURCE_NOT_FIND,
  UNKONWN_ERROR,
  VERIFY_BETA_WEAPP_ERROR,
} from "@/utils/messages";
import { generateResponse } from "lib/response";
import { formatMessage, getFromBody, getFromQuery, parseXml, sendFastMPErrorMessage } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next/types";
import {
  KEY_WECHAT_JSSDK_TICKET,
  KEY_WECHAT_TICKET,
  getItem,
  getOfficialAccountScanKey,
  setItem,
} from "lib/cache";
import {
  fastRegisterBetaMP,
  fastRegisterBetaMPCallback,
  getLoginAccessToken,
  get3rdAccessToken,
  getWechatUserInfo,
  saveBetaMPRegister,
  getCustomerMPAPIAccessToken,
  commitCodeToMP,
  authedMPCallback,
  generateQRCode,
  setMPDomain,
  mpCheck,
  betaMPVerifyCallback,
  verifyBetaMPService,
  setMpNicknameCallback,
  setMpName,
  uploadMedia,
  addCategory,
  getAllMPCategory,
  getMPCategory,
  submitAudit,
  modifySignature,
  modifyHeadImage,
  refreshAudit,
  mpLogin,
  setApiDomain,
  getLoginAccessToken2,
  getCacheTicket,
  createQrcode,
  getAccessToken,
  getWechatUserBaseInfo,
  findOrCreateMtbirdUserByWechatUser,
  jscode2session,
} from "lib/services/wx";
import prisma from "../prisma";
import { appCheck } from "lib/services/app";
import { isStringEmpty, randomString } from "@/utils/index";
import { generateKeys } from "@mtbird/core";
import requestIp from "request-ip";
import { buildLoginJWT, register } from "lib/services/auth";
import { offiaccountCallbackHandler } from "lib/services/offiaccount";

const { verify, sign } = require("jsonwebtoken");

const crypto = require("crypto");
const sha1 = require("js-sha1");

export const setApiDoaminController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  try {
    await setApiDomain(wxMp.id, wxMp.wxAppId as string);
  } catch (e: any) {
    return res.status(413).send(generateResponse(413, e.message));
  }

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const setMPDoaminController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  try {
    await setMPDomain(wxMp.id, wxMp.wxAppId as string);
  } catch (e: any) {
    return res.status(413).send(generateResponse(413, e.message));
  }

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const commitCodeController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;
  if (!wxMp.wxAppId)
    return res.status(400).send(generateResponse(400, MP_NOT_EXISTS));
  // 2. upload code
  await commitCodeToMP(
    wxMp.appId as string,
    wxMp.wxAppId,
    wxMp.wxMpTemplateId as string
  );
};

export const processCheck = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  let result = null;

  // 1. check qrcode generate
  if (wxMp.qrcodeUrl) result = wxMp.qrcodeUrl;
  else result = await generateQRCode(wxMp.id, wxMp.wxAppId as string);

  if (!result)
    return res.status(400).send(generateResponse(400, UNKONWN_ERROR));

  // 2. check domains setup
  try {
    if (!wxMp.domains) {
      // 2.1 set webview domain
      await setMPDomain(wxMp.id, wxMp.wxAppId as string);

      // 2.2 set api domain
      await setApiDomain(wxMp.id, wxMp.wxAppId as string);
    }
  } catch (e: any) {
    return res.status(413).send(generateResponse(413, e.message));
  }

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, { qrcodeUrl: result }));
};

export const wechatLoginStateCheck = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const state = getFromQuery(req, "state") as string;

  const userWechatInfo: any = await prisma.userWechatInfo.findFirst({
    where: {
      userId,
      state,
    },
  });

  if (userWechatInfo) {
    delete userWechatInfo.accessToken;
    delete userWechatInfo.refreshToken;
  }

  res.send(generateResponse(200, OPERATION_SUCCESS, userWechatInfo));
};

export const wxCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const signature = getFromQuery(req, "signature");
  const timestamp = getFromQuery(req, "timestamp");
  const nonce = getFromQuery(req, "nonce");
  const echostr = getFromQuery(req, "echostr");

  const array = [process.env.WX_TOKEN, timestamp, nonce].sort();

  // 3.将三个参数字符串拼接成一个字符串进行sha1加密
  const tempStr = array.join("");
  const hashCode = crypto.createHash("sha1");
  const resultCode = hashCode.update(tempStr, "utf8").digest("hex");

  // 开发者获得加密后的字符串可与 signature 对比，标识该请求来源于微信
  if (resultCode === signature) {
    res.send(echostr);
  } else {
    res.send("mismatch");
  }
};

export const wxPostCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const receiveEventXML: any = await parseXml(req.body);

    const receiveEvent = formatMessage(receiveEventXML.xml)
    const at = await getAccessToken();
    const userinfo = await getWechatUserBaseInfo(at, receiveEvent.FromUserName);
    console.log('wxPostCallback', receiveEvent)
    const response = await offiaccountCallbackHandler(receiveEvent.Event, receiveEvent.EventKey, userinfo);

    if (response) {
      return res.send(`
        <xml>
        <ToUserName><![CDATA[${receiveEvent.FromUserName}]]></ToUserName>
        <FromUserName><![CDATA[${receiveEvent.ToUserName}]]></FromUserName>
        <CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[${response}]]></Content>
      </xml>
    
      `)
    }

  } catch (error) {
    console.log('wxPostCallback', error);
  }

  res.send("ok");
}

// https://chenyejun.github.io/blog/weixinJSDK.html
export const getSign = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = getFromQuery(req, "url") as string; // 初始化jsdk的页面url，如果是单页应用记得截掉url的#部分

  let ticket: any = await getCacheTicket();

  const createNonceStr = () => Math.random().toString(36).substr(2, 15);
  const createTimeStamp = () => Math.floor(new Date().getTime() / 1000);
  const calcSignature = function (
    ticket: string,
    noncestr: string,
    ts: number,
    url: string
  ) {
    var str = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${ts}&url=${url}`;
    return sha1(str); //使用sha1加密算法
  };
  const noncestr = createNonceStr(); // 随机字符串
  const timestamp = createTimeStamp(); // 时间戳
  const signature = calcSignature(ticket, noncestr, timestamp, url); // 通过sha1算法得到签名
  res.send(
    generateResponse(200, OPERATION_SUCCESS, {
      noncestr: noncestr,
      timestamp: timestamp,
      signature: signature,
    })
  );
};

export const fastRegisterWeApp = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromBody(req, "appId") as string;

  if (!appId) return res.status(400).send(generateResponse(400, PARAMS_NEEDED));
  const app = await appCheck(res, appId, userId);

  if (!app) return;

  const userWxInfo = await prisma.userWechatInfo.findFirst({
    where: { userId },
  });

  if (!userWxInfo)
    return res.status(400).send(generateResponse(400, BIND_WX_FIRST));

  try {
    const accessToken = (await get3rdAccessToken()) as any;
    const registerRes: any = await fastRegisterBetaMP(
      accessToken,
      app.name,
      userWxInfo.openId
    );

    // wx error happened
    if (registerRes.errcode !== 0)
      return sendFastMPErrorMessage(res, registerRes);

    await saveBetaMPRegister(registerRes, appId, app.wxMpTemplateId as string);
    res.send(
      generateResponse(200, OPERATION_SUCCESS, {
        authorizeUrl: registerRes.authorize_url,
        uniqueId: registerRes.unique_id,
      })
    );
  } catch (e: any) {
    sendFastMPErrorMessage(res, e);
  }
};

// https://juejin.cn/post/7080527629639483423
export const wechatLogin = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const code = getFromQuery(req, "code") as string;
  let stateQuery = getFromQuery(req, "state") as string;
  const [state, ak] = stateQuery.split("@");
  const authData = verify(ak, process.env.JWT_SECRET);

  if (!authData || !authData.userId) return;

  const { userId } = authData;
  const asResult: any = await getLoginAccessToken(code);
  const userInfo = await getWechatUserInfo(
    asResult.access_token,
    asResult.openid
  );

  const userWechatInfo = await prisma.userWechatInfo.findFirst({
    where: {
      userId,
    },
  });

  const newUserInfo = {
    openId: asResult.openid,
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

  let result;

  if (userWechatInfo) {
    result = await prisma.userWechatInfo.update({
      data: newUserInfo,
      where: {
        userId,
      },
    });
  } else {
    result = await prisma.userWechatInfo.create({
      data: {
        ...newUserInfo,
        userId,
      },
    });
  }

  res.redirect("/wx/loginBack");
  // res.send(generateResponse(200, OPERATION_SUCCESS, result))
};

const WXCrypto = require("../../utils/WXCrypto");
const wx = new WXCrypto(
  process.env.WX_OPEN_TOKEN,
  process.env.WX_OPEN_AESKEY,
  process.env.NEXT_PUBLIC_WX_OPEN_APPID
);

export const ticketCallback = (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;
  const msgSignature = getFromQuery(req, "msg_signature");
  const timestamp = getFromQuery(req, "timestamp");
  const nonce = getFromQuery(req, "nonce");
  const [err, decryptedXML] = wx.decrypt(msgSignature, timestamp, nonce, body);

  const formatData = wx.parseWechatXML(decryptedXML);
  console.log("3. formatData:", formatData);

  switch (formatData.InfoType) {
    case "component_verify_ticket":
      setItem(KEY_WECHAT_TICKET, formatData.ComponentVerifyTicket);
      break;

    // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorize_event.html
    case "authorized":
    case "updateauthorized":
    case "unauthorized":
      authedMPCallback(formatData);
      break;

    // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/beta_Mini_Programs/fastregister.html
    case "notify_third_fastregisterbetaapp":
      console.log(
        "[0] callback notify_third_fastregisterbetaapp:",
        wx.parseWechatXML(formatData.info)
      );
      formatData.info = wx.parseWechatXML(formatData.info.replace("\n", ""));
      fastRegisterBetaMPCallback(formatData);
      break;

    // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/beta_Mini_Programs/fastverify.html
    case "notify_third_fastverifybetaapp":
      betaMPVerifyCallback(formatData);
      break;

    // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/wxa_nickname_audit.html
    case "wxa_nickname_audit":
      setMpNicknameCallback(formatData);
      break;
  }

  res.send("success");
};

export const mpMessageCallback = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { body } = req;
  console.log("[mpMessageCallback] 1. body:", body);

  const wxAppId = getFromQuery(req, "wxAppId");
  const msgSignature = getFromQuery(req, "msg_signature");
  const timestamp = getFromQuery(req, "timestamp");
  const nonce = getFromQuery(req, "nonce");
  const [err, decryptedXML] = wx.decrypt(msgSignature, timestamp, nonce, body);

  const formatData = wx.parseWechatXML(decryptedXML);
  console.log("[mpMessageCallback] 2. formatData:", formatData);

  switch (formatData.MsgType) {
    // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/audit_event.html
    case "event":
      switch (formatData.Event) {
        case "weapp_audit_success":
        case "weapp_audit_fail":
          const wxMp = await prisma.wxMiniProgram.findFirst({
            where: {
              wxAppId,
            },
          });
          console.log("[mpMessageCallback] 3. wxMp:", wxMp);
          await refreshAudit(wxMp);
          break;
      }
      break;
  }

  res.send("success");
};

export const getMPAccessToken = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  const ak3rd = await get3rdAccessToken();
  const ak = await getCustomerMPAPIAccessToken(ak3rd as any, wxMp.wxAppId as string);

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, { ak }));
};

/**
 *
 * @param req get Wx mini program object
 * @param res
 * @param userId
 * @returns
 */
export const getWxMP = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;
  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, wxMp));
};

export const commitCode = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  console.log("[commitCode] before:");

  try {
    const result = await commitCodeToMP(
      wxMp.appId,
      wxMp.wxAppId as string,
      wxMp.wxMpTemplateId
    );

    if (result) {
      return res
        .status(200)
        .send(generateResponse(200, OPERATION_SUCCESS, result));
    }
  } catch (e: any) {
    console.log("[commitCode] e:", e);
    return res.status(400).send(generateResponse(400, e.message));
  }
  return res.status(400).send(generateResponse(400, UNKONWN_ERROR));
};

export const verifyBetaMP = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  const companyId = getFromBody(req, "companyId");

  const company = await prisma.companyInfo.findFirst({
    where: {
      id: companyId,
    },
  });

  const result: any = await verifyBetaMPService(wxMp.wxAppId, company);

  console.log("[verifyBetaMP] result:", result);

  if (result.errcode === 0) {
    await prisma.wxMiniProgram.update({
      data: {
        status: "verifyReleasing",
        companyId,
      },
      where: {
        id: wxMp.id,
      },
    });

    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
  }

  if (VERIFY_BETA_WEAPP_ERROR[result.errcode]) {
    return res
      .status(400)
      .send(
        generateResponse(400, VERIFY_BETA_WEAPP_ERROR[result.errcode], result)
      );
  }

  return res.status(400).send(generateResponse(400, result.errmsg, result));
};

export const setMpNameController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  const name = getFromBody(req, "name");
  const company = await prisma.companyInfo.findFirst({
    where: { id: wxMp.companyId },
  });
  const mediaRes = (await uploadMedia(
    wxMp.wxAppId,
    "image",
    company?.licenseUrl as string
  )) as any;
  const reNameResult = (await setMpName(
    name,
    mediaRes.media_id,
    wxMp.wxAppId
  )) as any;

  if (reNameResult.errcode === 0) {
    await prisma.wxMiniProgram.update({
      where: {
        id: wxMp.id,
      },
      data: {
        officalName: name,
        isVerifyName: true,
        renameStatus: reNameResult.errcode + "",
        renameMessage: reNameResult.errmsg + "",
      },
    });

    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
  }

  await prisma.wxMiniProgram.update({
    where: {
      id: wxMp.id,
    },
    data: {
      nameAuditId: reNameResult.audit_id,
      renameStatus: reNameResult.errcode + "",
      renameMessage: reNameResult.errmsg,
    },
  });

  return res
    .status(400)
    .send(
      generateResponse(
        400,
        reNameResult.errMessage || reNameResult.errmsg,
        reNameResult
      )
    );
};

export const addCategoryController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  const categories = getFromBody(req, "categories", false);

  console.log("[addCategoryController] ategories:", categories);

  const resultAdd = (await addCategory(wxMp.wxAppId, categories)) as any;

  if (resultAdd.errcode === 0) {
    await prisma.wxMiniProgram.update({
      where: {
        id: wxMp.id,
      },
      data: {
        categories,
      },
    });
    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
  }

  res.status(400).send(generateResponse(400, resultAdd.errmsg, resultAdd));
};

export const getAllCategoriesController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  const result = (await getAllMPCategory(wxMp.wxAppId)) as any;
  res
    .status(200)
    .send(
      generateResponse(
        200,
        OPERATION_SUCCESS,
        result.categories_list.categories
      )
    );
};

export const auditMpController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  const versionDesc = getFromBody(req, "versionDesc", false);
  const feedbackInfo = getFromBody(req, "feedbackInfo", false);

  const categoryList = (await getMPCategory(wxMp.wxAppId)) as any;
  console.log("[auditMpController] categoryList:", categoryList);

  const itemList = categoryList.category_list;
  const submitRes = (await submitAudit(
    itemList,
    versionDesc,
    feedbackInfo,
    wxMp.wxAppId
  )) as any;

  if (submitRes.errcode === 0) {
    await prisma.wxMiniProgram.update({
      where: {
        id: wxMp.id,
      },
      data: {
        status: "auditing",
        auditId: submitRes.auditid + "",
      },
    });
    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
  }

  res.status(400).send(generateResponse(400, submitRes.errmsg, submitRes));
};

export const syncMPDetails = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const appId = getFromQuery(req, "appId") as string;
  if (!appId) {
    res.status(400).send(generateResponse(400, PARAMS_ERROR));
    return false;
  }

  const app = await appCheck(res, appId, userId);
  if (!app) return;
  const wxMp = (await mpCheck(req, res, userId, app as any)) as any;
  if (!wxMp) return;

  if (isStringEmpty(app.name))
    res.status(400).send(generateResponse(400, APP_NAME_NOT_SETUP));
  if (isStringEmpty(app.desc as string))
    res.status(400).send(generateResponse(400, APP_DESC_NOT_SETUP));
  if (isStringEmpty(app.avatar as string))
    res.status(400).send(generateResponse(400, APP_AVATAE_NOT_SETUP));

  try {
    // 1. name sync with wechat
    const name = app.name;
    const company = await prisma.companyInfo.findFirst({
      where: { id: wxMp.companyId },
    });
    const mediaRes = (await uploadMedia(
      wxMp.wxAppId,
      "image",
      company?.licenseUrl as string
    )) as any;
    const reNameResult = (await setMpName(
      name,
      mediaRes.media_id,
      wxMp.wxAppId
    )) as any;

    if (reNameResult.errcode !== 0) {
      await prisma.wxMiniProgram.update({
        where: {
          id: wxMp.id,
        },
        data: {
          nameAuditId: reNameResult.audit_id,
          renameStatus: reNameResult.errcode + "",
          renameMessage: reNameResult.errmsg,
        },
      });
      return res
        .status(400)
        .send(generateResponse(400, reNameResult.errmsg, reNameResult));
    }

    // 2. signature sync with wechat
    const resultSig = (await modifySignature(
      wxMp.wxAppId as string,
      app.desc as string
    )) as any;
    console.log("[setAppDetails] avatar avatar:", app.desc);

    if (resultSig.errcode !== 0) {
      return res
        .status(400)
        .send(generateResponse(400, resultSig.errmsg, resultSig));
    }

    // 3. headImage sync with wechat
    const resultAvatar = (await modifyHeadImage(
      wxMp.wxAppId as string,
      app.avatar as string
    )) as any;
    console.log("[setAppDetails] avatar:", app.avatar);

    if (resultAvatar.errcode !== 0) {
      return res
        .status(400)
        .send(generateResponse(400, resultAvatar.errmsg, resultAvatar));
    }

    await prisma.wxMiniProgram.update({
      where: {
        id: wxMp.id,
      },
      data: {
        officalName: name,
        isVerifyName: true,
        isDetailsSetup: true,
        renameStatus: reNameResult.errcode + "",
        renameMessage: reNameResult.errmsg + "",
      },
    });

    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
  } catch (e: any) {
    console.log("[syncMPDetails] e:", e);
    return res.status(200).send(generateResponse(200, e.message));
  }
};

export const syncAuditStatusController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  console.log("[syncAuditStatusController] userId:", userId);

  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  console.log("[syncAuditStatusController] wxMp:", wxMp);

  try {
    const result = (await refreshAudit(wxMp)) as any;
    if (result.errcode === 0) {
      console.log("[syncAuditStatusController] result1:", result);
      return res
        .status(200)
        .send(generateResponse(200, OPERATION_SUCCESS, result));
    }
    console.log("[syncAuditStatusController] result2:", result);
    return res.status(400).send(generateResponse(400, result.errmsg, result));
  } catch (e: any) {
    console.log("[syncAuditStatusController] result3:", e);
    return res.status(400).send(generateResponse(400, e.errmsg, e));
  }
};

export const refreshOfficalQrcode = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const wxMp = (await mpCheck(req, res, userId)) as any;
  if (!wxMp) return;

  try {
    await generateQRCode(wxMp.id, wxMp.wxAppId as string, true);
    res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
  } catch (e: any) {
    res.status(200).send(generateResponse(200, e.message, e));
  }
};

export const wxLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("====== wxLogin req.body:", req.body);

  const code = getFromBody(req, "code") as string;
  const customerAppId = getFromBody(req, "customerAppId") as string;
  const mtbirdAppId = getFromBody(req, "mtbirdAppId") as string;

  if (isStringEmpty(customerAppId) || isStringEmpty(mtbirdAppId)) {
    return res.status(400).send(generateResponse(400, PARAMS_ERROR));
  }

  const wxMp = await prisma.wxMiniProgram.findFirst({
    where: {
      wxAppId: customerAppId,
    },
  });

  if (!wxMp) {
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  }

  console.log("====== wxMp.appId:", wxMp.id, wxMp.appId, mtbirdAppId);

  // if (wxMp.appId !== mtbirdAppId) {
  //   return res.status(400).send(generateResponse(400, PARAMS_ERROR));
  // }

  try {
    let result = {} as Record<string, any>;
    if (code) {
      result = (await mpLogin(customerAppId, code)) as any;
    }

    const token = sign(
      {
        customerAppId, // 用户小程序id
        openId: result?.openid || `mtbird-${generateKeys()}`,
        unionId: result?.unionid || `mtbird-${generateKeys()}`,
        session_key: result?.session_key || `mtbird-${generateKeys()}`,
        mtbirdAppId: wxMp.appId,
      },
      process.env.JWT_THIRD_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res
      .status(200)
      .send(generateResponse(200, OPERATION_SUCCESS, { thirdToken: token }));
  } catch (e: any) {
    res.status(200).send(generateResponse(200, e.message, e));
  }
};

/** 微信浏览器授权登录 */
export const wechatAuthorize = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const code = getFromBody(req, "code") as string;
  const appId = getFromBody(req, "appId") as string;
  const state = getFromBody(req, "state") as string;
  const to = getFromBody(req, "to") as string;
  const registryInfo = getFromBody(req, "registryInfo");

  const asResult: any =
    state === "QRCODE"
      ? await getLoginAccessToken(code)
      : await getLoginAccessToken2(code);

  if (!asResult.access_token || !asResult.openid) {
    console.error("wechatAuthorize getLoginAccessToken error", asResult);
    return res
      .status(400)
      .send(
        generateResponse(
          400,
          asResult.errmsg
            ? `${asResult.errcode} - ${asResult.errmsg}`
            : "get access token error"
        )
      );
  }

  const userInfo = await getWechatUserInfo(
    asResult.access_token,
    asResult.openid
  );

  // 测试号获取不到unionId
  if (
    (process.env.NODE_ENV === "production" && !userInfo.unionid) ||
    !userInfo.openid
  ) {
    console.error("getWechatUserInfo error", userInfo);
    return res
      .status(400)
      .send(
        generateResponse(400, asResult.errmsg || "get wechat user info error")
      );
  }

  const mtbirdUser = await findOrCreateMtbirdUserByWechatUser(userInfo, req, to, registryInfo, asResult, state);

  if (!mtbirdUser) {

    return res.status(500).send(generateResponse(500, '微信注册失败'));
  }

  const token = await buildLoginJWT(mtbirdUser.id, to, appId);

  try {
    // add login log
    await prisma.userLoginLog.create({
      data: {
        userId: mtbirdUser.id,
        loginMethod: "wechat",
        ip: requestIp.getClientIp(req),
      },
    });
  } catch (error) {
  }

  const response = {
    id: mtbirdUser.id,
    name: mtbirdUser.name,
    avatar: mtbirdUser.avatar,
    phone: mtbirdUser.phone,
    email: mtbirdUser.email,
    teams: mtbirdUser.Team,
    token,
  };


  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, response));
};


export const wechatMPAuthorize = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const code = getFromBody(req, "code") as string;
  const appId = getFromBody(req, "appId") as string;
  const to = getFromBody(req, "to") as string;
  const registryInfo = getFromBody(req, "registryInfo");
  const asResult: any = await jscode2session(code);

  // if (!asResult.access_token || !asResult.openid) {
  //   console.error("wechatAuthorize getLoginAccessToken error", asResult);
  //   return res
  //     .status(400)
  //     .send(
  //       generateResponse(
  //         400,
  //         asResult.errmsg
  //           ? `${asResult.errcode} - ${asResult.errmsg}`
  //           : "get access token error"
  //       )
  //     );
  // }
  // const userInfo = await getWechatUserInfo(
  //   asResult.access_token,
  //   asResult.openid
  // );
  // 测试号获取不到unionId
  if (
    (process.env.NODE_ENV === "production" && !asResult.unionid) ||
    !asResult.openid
  ) {
    console.error("getWechatUserInfo error", asResult);
    return res
      .status(400)
      .send(
        generateResponse(400, asResult.errmsg || "get wechat user info error")
      );
  }
  asResult.mpOpenid = asResult.openid
  const mtbirdUser = await findOrCreateMtbirdUserByWechatUser(
    asResult,
    req,
    {
      tag: to,
      way: "小程序",
    },
    registryInfo,
    asResult
  );

  if (!mtbirdUser) {

    return res.status(500).send(generateResponse(500, '微信注册失败'));
  }

  const token = await buildLoginJWT(mtbirdUser.id, to, appId);

  try {
    // add login log
    await prisma.userLoginLog.create({
      data: {
        userId: mtbirdUser.id,
        loginMethod: "miniProgram",
        ip: requestIp.getClientIp(req),
      },
    });
  } catch (error) {
  }

  const response = {
    id: mtbirdUser.id,
    name: mtbirdUser.name,
    avatar: mtbirdUser.avatar,
    phone: mtbirdUser.phone,
    email: mtbirdUser.email,
    teams: mtbirdUser.Team,
    mpOpenid: asResult.mpOpenid,
    token,
  };


  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, response));
}

export const getWechatMPOpenId = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const code = getFromQuery(req, "code") as string;
  const to = getFromQuery(req, "to") as string;
  const asResult: any = await jscode2session(code);

  const response = {
    mpOpenid: asResult.openid,
  };

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, response));

}

export const wechatBind = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const state = getFromBody(req, "state") as string;
  const code = getFromBody(req, "code") as string;
  const asResult: any = await getLoginAccessToken2(code);

  if (!asResult.access_token || !asResult.openid) {
    console.error("wechatBind getLoginAccessToken error", asResult);
    return res
      .status(400)
      .send(
        generateResponse(
          400,
          asResult.errmsg
            ? `${asResult.errcode} - ${asResult.errmsg}`
            : "get access token error"
        )
      );
  }

  const wechatUserInfo = await getWechatUserInfo(
    asResult.access_token,
    asResult.openid
  );

  // 测试号获取不到unionId
  if (
    (process.env.NODE_ENV === "production" && !wechatUserInfo.unionid) ||
    !wechatUserInfo.openid
  ) {
    console.error("getWechatUserInfo error", wechatUserInfo);
    return res
      .status(400)
      .send(
        generateResponse(400, asResult.errmsg || "get wechat user info error")
      );
  }

  const mtbirdUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      UserWechatInfo: true,
    },
  });

  if (!mtbirdUser)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  const newWechatUserInfo = {
    openId: asResult.openid,
    accessToken: asResult.access_token,
    refreshToken: asResult.refresh_token,
    nickname: wechatUserInfo.nickname,
    sex: wechatUserInfo.sex,
    province: wechatUserInfo.province,
    city: wechatUserInfo.city,
    country: wechatUserInfo.country,
    headImage: wechatUserInfo.headimgurl,
    privilege: wechatUserInfo.privilege,
    unionId: wechatUserInfo.unionid,
    state,
  };

  // 该用户未绑定过微信
  if (!mtbirdUser.UserWechatInfo) {
    console.log('[wechatBind]', ' not bound WeChat')
    await prisma.userWechatInfo.create({
      data: {
        ...newWechatUserInfo,
        userId: mtbirdUser.id,
      },
    });
  } else {
    // 更新openid
    if (mtbirdUser.UserWechatInfo.openId !== asResult.openid) {
      console.log('[wechatBind]', ' update user openId', mtbirdUser.UserWechatInfo.openId, asResult.openid)
      // await prisma.userWechatInfo.update({
      //   where: {
      //     id: mtbirdUser.UserWechatInfo.id,
      //   },
      //   data: newWechatUserInfo,
      // });
    } else {
      console.log('[wechatBind]', ' use ', mtbirdUser.UserWechatInfo.openId, asResult.openid)
    }

  }

  res.status(200).send(
    generateResponse(200, OPERATION_SUCCESS, {
      openId: asResult.openid,
    })
  );
};

export const getShowQrCode = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const scene = getFromBody(req, 'scene');
  const accessToken = await getAccessToken();

  const sceneStr = randomString(12);

  const qrcode = await createQrcode(accessToken, {
    id: sceneStr,
    scene,
  })

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, {
    expire: qrcode.expire_seconds,
    url: qrcode.url,
    key: sceneStr,
    scene: {
      registryInfo: scene.registryInfo,
      to: scene.to
    }
  }));
}



export const checkLogin = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const sceneId = getFromQuery(req, 'sceneId');
  if (!sceneId) return  res.status(400)
  .send(
    generateResponse(
      400,
      PARAMS_ERROR
    )
  );
  let data = await getItem(getOfficialAccountScanKey(sceneId));
  if (data) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      
    }
  }

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data as any));
}
