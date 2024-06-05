// This file is auto-generated, don't edit it
import Dysmsapi20170525, * as $Dysmsapi20170525 from "@alicloud/dysmsapi20170525";
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import * as $OpenApi from "@alicloud/openapi-client";
import * as $Util from "@alicloud/tea-util";
import axios from "axios";

export const generateVerifyCode = () => {
  return Math.random().toString().slice(-6);
};

export const createClient = (
  accessKeyId: string,
  accessKeySecret: string
): Dysmsapi20170525 => {
  let config = new $OpenApi.Config({
    // 您的 AccessKey ID
    accessKeyId: accessKeyId,
    // 您的 AccessKey Secret
    accessKeySecret: accessKeySecret,
  });
  // 访问的域名
  config.endpoint = `dysmsapi.aliyuncs.com`;
  return new Dysmsapi20170525(config);
};

export const send = async (
  phone: string,
  templateParam = "",
  templateCode = "SMS_246580043"
) => {
  // if (!templateParam) templateParam =  `{\"code\":\"${code}\"}`
  let client = createClient(
    process.env.MESSAGE_ID as string,
    process.env.MESSAGE_SRT as string
  );
  let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
    signName: "星搭",
    templateCode,
    phoneNumbers: phone,
    templateParam,
  });
  let runtime = new $Util.RuntimeOptions({});
  await client.sendSmsWithOptions(sendSmsRequest, runtime);
};

export const sendMsgToBot = async (msg: string) => {
  if (process.env.NODE_ENV === 'development') return;

  return axios.post(process.env.NOTICE_BOT_HOOK as string, {
    msgtype: "text",
    text: {
      content: msg,
    },
  });
};
