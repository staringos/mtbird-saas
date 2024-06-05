import {
  OPERATION_SUCCESS,
  ORDER_STATUS_ERROR,
  PARAMS_NEEDED,
  RESOURCE_NOT_FIND,
  UNKONWN_ERROR,
} from "@/utils/messages";
import { generateResponse } from "lib/response";
import { getFromBody, getFromQuery } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../prisma";
import {
  orderCheck,
  payAlipay,
  payWechat,
  subscriptionPaySuccess,
} from "lib/services/order";
import requestIp from "request-ip";
import { sendMsgToBot } from "lib/sendMsg";
import { checkAlipayNotify, wechatPayer } from "lib/pay";
import { lock, tryLock, unlock } from "lib/utils/dlm";
import { OrderStatus, SubscriptionOrder } from "@prisma/client";

// 关闭订单
export const closeOrder = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const order = await orderCheck(req, res, userId);
  if (!order) return;
  if (order.status !== "created" && order.status !== "confirming")
    return res.status(200).send(generateResponse(200, ORDER_STATUS_ERROR));

  const newOrder = await prisma.subscriptionOrder.update({
    where: {
      id: order.id,
    },
    data: {
      status: "closed",
    },
  });

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, newOrder));
};

// 对公转账上传转账凭证
export const transferCertificateSubmit = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const order = await orderCheck(req, res, userId);
  if (!order) return;

  const certificateUrl = getFromBody(req, "certificateUrl");

  const newOrder = await prisma.subscriptionOrder.update({
    where: {
      id: order.id,
    },
    data: {
      certificateUrl,
      status: "confirming",
      payWay: "transfer",
    },
  });

  sendMsgToBot(
    `💰 [对公转账审核] 订单: ${order.id} 提交审核，¥ ${order.price}，请尽快审核`
  );

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, newOrder));
};

export const getAllGoods = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const goods = await prisma.subscriptionGood.findMany({
    orderBy: [
      {
        sort: "asc",
      },
    ],
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, goods));
};

export const getOrderDetail = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const order = await orderCheck(req, res, userId);
  if (!order) return;
  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, order));
};

export const getOrderPayStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const order = await orderCheck(req, res, userId);
  if (!order) return;

  const ciphertext = getFromBody(req, "ciphertext");
  const associated_data = getFromBody(req, "associated_data");
  const nonce = getFromBody(req, "nonce");
  const key = getFromBody(req, "key");

  const result: any = await wechatPayer.decipher_gcm(
    ciphertext,
    associated_data,
    nonce,
    key
  );
  console.log("result", result);

  if (result.trade_state === "SUCCESS") {
    sendMsgToBot(
      `💰 [新订阅收入]: ${order.price} 元 | ${order.version} 版 ${
        order.times
      } ${order.period === "monthly" ? "月" : "年"} | id: ${order.id} 🎉🎉`
    );

    const newOrder = await prisma.subscriptionOrder.update({
      where: {
        id: order.id,
      },
      data: {
        status: "paid",
        tradeBankType: result.bank_type,
        tradeType: result.trade_type,
        tradeTransactionId: result.transaction_id,
        payTime: result.success_time,
      },
    });
    return res
      .status(200)
      .send(generateResponse(200, OPERATION_SUCCESS, newOrder));
  } else {
    return res
      .status(200)
      .send(generateResponse(200, result.trade_state_desc, result));
  }
};

// https://opendocs.alipay.com/support/01raw4
export const orderAlipayNotify = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const method = req.method === "GET" ? getFromQuery : getFromBody;

  const sign = method(req, "sign");
  const orderId = method(req, "out_trade_no");
  const totalAmount = method(req, "total_amount");
  const tradeNo = method(req, "trade_no");
  console.log(
    "[orderAlipayNotify] params:",
    req.method,
    sign,
    orderId,
    totalAmount,
    tradeNo
  );
  console.log("[orderAlipayNotify] postData:", req.body, "|", req.query);
  let result = await checkAlipayNotify(req.body);
  console.log("[orderAlipayNotify] result:", result);

  if (!result) return res.status(400).send("fail");
  console.log("[orderAlipayNotify] after result:", result, orderId);

  const order = await prisma.subscriptionOrder.findFirst({
    where: {
      id: orderId,
    },
  });

  console.log("[orderAlipayNotify] order:", order);

  // if (order?.status === 'paid' && req.method === 'GET') return res.redirect(307, `/team/upgrade/order/${order.id}/pay/success`);

  if (!order) return res.status(404).send("fail");

  if (order.status === "paid") return res.status(200).send("success");

  // 1.00 元 是测试价格
  if (
    process.env.NODE_ENV === "production" &&
    order.price.toFixed(2) !== totalAmount &&
    totalAmount !== "1.00"
  ) {
    console.log("[orderAlipayNotify] price not much:", order.price);
    return res.status(400).send("fail");
  }

  await subscriptionPaySuccess(order as any, undefined, "alipay");

  // if (req.method === 'GET') {
  //   return res.redirect(307, `/team/upgrade/order/${order.id}/pay/success`);
  // }

  return res.status(200).send("success");
};

export const orderWecahtNotify = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log("[wechatNotifyController]:", req.body)
  try {
    // 接收请求数据
    const postBody = req.body;

    // 获取 headers 中的相关字段
    // const wxTimestamp = req.headers['wechatpay-timestamp'];
    // const wxNonce = req.headers['wechatpay-nonce'];
    // const wxSignature = req.headers['wechatpay-signature'];
    const { ciphertext, associated_data, nonce } = postBody?.resource
    console.log("ppp pay params:", ciphertext, associated_data, nonce, process.env.WX_PAY_SECRET_V2)
    const result: any = await wechatPayer.decipher_gcm(ciphertext, associated_data, nonce, process.env.WX_PAY_SECRET_V2);
    console.log("result:", result)

    const tradeNo = result.out_trade_no

    // lock
    const lockKey = `member-subscription-${tradeNo}`;
    const identifier = `lock:${Date.now()}:${Math.random()}`;
    const lockTimeout = 10; // 10 秒

    const locked = await lock(lockKey, identifier, lockTimeout);

    try {
      if (!locked) {
        console.error("[orderAlipayNotify] try lock failed:", tradeNo);
        return res.status(200).send("success");
      }

      const subscription = await prisma.subscriptionOrder.findUnique({
        where: {
          id: tradeNo,
        }
      })

      if (!subscription) {
        console.log("[orderAlipayNotify] subscription not found:", tradeNo);
        return res.status(200).send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>')
      }

      if (subscription.status !== OrderStatus.created) {
        console.error("[orderAlipayNotify] status not created:", tradeNo);
        return res.status(200).send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>')
      }

      if (result.trade_state === 'SUCCESS') {
        await subscriptionPaySuccess(subscription as any, undefined, "wechat");
      } else {
        await subscriptionPayFailed(subscription);
      }

      res.status(200).send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>')
    } catch (e) {
      console.log("[ERROR] e:", e)
    } finally {
      await unlock(lockKey, identifier);
    }
  } catch (e) {
    console.log("e:", e)
  }
}


export const subscriptionPayFailed = async (subscriptionOrder: SubscriptionOrder) => {
  const orderResult = await prisma.subscriptionOrder.update({
    where: {
      id: subscriptionOrder.id,
    },
    data: {
      status: "closed",
      payTime: new Date(),
    },
  });
}

export const orderPay = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const order = await orderCheck(req, res, userId);
  if (!order) return;

  const payWay = getFromBody(req, "payWay");

  if (!payWay)
    return res.status(400).send(generateResponse(400, PARAMS_NEEDED));

  try {
    let result = {};

    if (payWay === "alipay") {
      const url = await payAlipay(order as any);
      result = { h5_url: url };
    }

    if (payWay === "wechat") {
      const detectedIp = requestIp.getClientIp(req);
      result = await payWechat(order as any, detectedIp as string);
    }

    console.log(`${payWay} pay result==========>`, result, payWay);
    return res
      .status(200)
      .send(generateResponse(200, OPERATION_SUCCESS, result));
  } catch (error: any) {
    console.log("EEE:", error, error.response);
    return res.status(500).send(generateResponse(500, UNKONWN_ERROR, error));
  }
};
