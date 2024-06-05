import WxPay from "wechatpay-node-v3"; // 支持使用require
import fs from "fs";
import path from "path";
import AlipaySdk from "alipay-sdk";

// 微信支付器
// export const wechatPayer = new WxPay({
//   appid: process.env.WX_SERVICE_APPID as string,
//   mchid: process.env.WX_PAY_MCHID as string,
//   publicKey: fs.readFileSync("./cert/wechat/apiclient_cert.pem"), // 公钥
//   privateKey: fs.readFileSync("./cert/wechat/apiclient_key.pem"), // 秘钥
// });

export const wechatPayer = {} as any;
const privateKey = fs.readFileSync("./cert/alipay/private-key.pem", "ascii");

// 支付宝支付器
// export const alipayPayer = new AlipaySdk({
//   appId: (process.env.ALIPAY_APP_ID as string) || '',
//   privateKey,
//   alipayPublicKey: fs.readFileSync(
//     "./cert/alipay/alipay-public-key.pem",
//     "ascii"
//   ),
//   signType: "RSA2",
//   gateway: "https://openapi.alipay.com/gateway.do",
//   //可设置AES密钥，调用AES加解密相关接口时需要（可选）
//   // encryptKey: '请填写您的AES密钥，例如：aa4BtZ4tspm2wnXLb1ThQA'
// });

export const alipayPayer = {} as any;

// 无需加密的接口
// const result = await alipaySdk.exec('alipay.system.oauth.token', {
// 	grantType: 'authorization_code',
// 	code: 'code',
// 	refreshToken: 'token'
// });

// // 需要AES加解密的接口
// await alipaySdk.exec('alipay.open.auth.app.aes.set', {
//   bizContent: {
//     merchantAppId: '2021001170662064'
//   },
//   // 自动AES加解密
//   needEncrypt: true
// });

// const path = require('path');

// 用于通知验签
// ------配置 alipay SDK 环境
// 导入 SDK
// const AlipaySDK = require("alipay-sdk").default;
// // 导入配置
// const alipayConfig = require(path.join(__dirname, './alipay_config.js'));
// // 初始化
// const alipaySdk = new AlipaySDK(alipayConfig.AlipayBaseConfig);

export const checkAlipayNotify = async (obj: any) => {
  const result = await alipayPayer.checkNotifySign(obj);
  return result;
};
