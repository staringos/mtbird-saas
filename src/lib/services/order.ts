import { RESOURCE_NOT_FIND } from "@/utils/messages";
import { generateResponse } from "lib/response";
import { getFromQuery } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../prisma";
import { alipayPayer, wechatPayer } from "lib/pay";
import { IOrderDTO } from "@/types/entities/Order";
import { ORDER_FROM, TEAM_VERSIONS_DICT } from "@/utils/constants";
import { toSubscription } from "./subscription";
import { OrderPayWay, OrderStatus, SubscriptionOrder } from "@prisma/client";
import axios from "axios";
import { sendMsgToBot } from "lib/sendMsg";
import { Decimal } from "@prisma/client/runtime";
const jwt = require("jsonwebtoken");
const AlipayFormData = require("alipay-sdk/lib/form").default;

export const orderCheck = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id");

  const order = await prisma.subscriptionOrder.findFirst({
    where: {
      id,
      orderUserId: userId,
    },
  });

  if (!order) {
    res.status(404).send(generateResponse(200, RESOURCE_NOT_FIND));
    return false;
  }
  return order;
};

export async function closeWechatOrder(out_trade_no: string) {
  const result = await wechatPayer.close(out_trade_no);

  console.log("关闭 wechat 订单", out_trade_no, result);
}

export const closeUnpaidWecahtOrder = async (userId: string) => {
  const order = await prisma.subscriptionOrder.findFirst({
    where: {
      orderUserId: userId,
      status: {
        in: [OrderStatus.created],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (order && order.payWay === "wechat") {
    await closeWechatOrder(order.id);
  }
};

export const payWechatV2 = async (
  device: string,
  order: SubscriptionOrder,
  detectedIp: string,
  openId?: string
) => {
  const params = {
    description: order.desc,
    out_trade_no: order.id,
    notify_url: `${process.env.NEXT_PUBLIC_HOST}/api/order/${order.id}/wechat/callback`,
    amount: {
      total: new Decimal(order.price).times(100).toNumber(),
    },
    scene_info: {
      payer_client_ip: detectedIp || "0:0:0:0",
      h5_info: {
        type: "Wap",
        app_name: "星搭云",
        app_url: "https://mtbird.staringos.com",
      },
    },
  } as any;

  console.log(params);
  console.log("openId", openId);

  if (openId) {
    params.payer = {
      openid: openId,
    };
    delete params.scene_info.h5_info;
    // 微信小程序平台
    // result = await wechatAppletsPayer.transactions_jsapi(params);
    let result;
    result = await wechatPayer.transactions_jsapi(params);
    console.log("jsapi", result);
    return result.status ? result.data : result;;
  }

  // 微信的h5指网页支付
  if (device === "h5") {
    const result: any = await wechatPayer.transactions_h5(params);
    console.log("result", result);

    if (typeof result.h5_url === "string") {
      result.h5_url += `&redirect_url=${order.returnUrl || ""}`;
    }

    return result.h5_url;
  }

  delete params.scene_info.h5_info;
  const result: any = await wechatPayer.transactions_native(params);
  console.log(result, '<<<<')
  if (result.status !== 200) {
    throw new Error(`${result.status}: ${result.message}`);
  }

  return result.data.code_url;
};

/** 旧微信支付方法，使用wechatTrade代替 */
export const payWechat = async (order: IOrderDTO, detectedIp: string) => {
  // 参数介绍请看h5支付文档 https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
  const params: any = {
    appid: process.env.WX_SERVICE_APPID,
    mchid: process.env.WX_PAY_MCHID,
    description: "测试",
    out_trade_no: order.id,
    notify_url: `${process.env.HOST}/team/upgrade/order/${order.id}/pay/callback`,
    amount: {
      total:
        process.env.NODE_ENV === "development"
          ? (0.1).toFixed(2)
          : order.price.toFixed(2),
    },
    scene_info: {
      payer_client_ip: detectedIp,
      h5_info: {
        type: "Wap",
        app_name: "星搭",
        app_url: "https://mtbird.staringos.com",
      },
    },
  };
  return await wechatPayer.transactions_h5(params);
};

// https://juejin.cn/post/6873368324227629069
export const payAlipay = async (order: IOrderDTO) => {
  const versionName = TEAM_VERSIONS_DICT[order.version];
  const formData = new AlipayFormData();

  formData.setMethod("get");
  // 在用户支付完成之后，支付宝服务器会根据传入的 notify_url，以 POST 请求的形式将支付结果作为参数通知到商户系统。
  formData.addField(
    "notifyUrl",
    `https://mtbird.staringos.com/api/order/${order.id}/alipay/callback`
  ); // 支付成功回调地址，必须为可以直接访问的地址，不能带参数
  formData.addField(
    "returnUrl",
    order.returnUrl ||
      `https://mtbird.staringos.com//team/upgrade/order/${order.id}/pay/success`
  ); // 支付成功回调地址，必须为可以直接访问的地址，不能带参数

  formData.addField("bizContent", {
    outTradeNo: order.id, // 商户订单号,64个字符以内、可包含字母、数字、下划线,且不能重复
    productCode: "FAST_INSTANT_TRADE_PAY", // 销售产品码，与支付宝签约的产品码名称,仅支持FAST_INSTANT_TRADE_PAY
    totalAmount: order.price.toFixed(2), // 订单总金额，单位为元，精确到小数点后两位
    subject: order.name || `${versionName}订阅`, // 订单标题
    body: order.desc || `星搭${versionName}订阅费用`, // 订单描述
  });

  console.log("formData:", formData, formData.fields[1].value);

  return await alipayPayer.exec(
    "alipay.trade.page.pay",
    {},
    { formData: formData }
  );
};

export const payAlipayV2 = async (
  device: string,
  order: SubscriptionOrder,
  returnUrl?: string
) => {
  const formData = new AlipayFormData();

  formData.setMethod("get");
  // 在用户支付完成之后，支付宝服务器会根据传入的 notify_url，以 POST 请求的形式将支付结果作为参数通知到商户系统。
  formData.addField(
    "notifyUrl",
    `https://mtbird.staringos.com/api/order/${order.id}/alipay/callback`
  ); // 支付成功回调地址，必须为可以直接访问的地址，不能带参数
  formData.addField(
    "returnUrl",
    returnUrl ||
      `https://mtbird.staringos.com//team/upgrade/order/${order.id}/pay/success`
  ); // 支付成功回调地址，必须为可以直接访问的地址，不能带参数

  formData.addField("bizContent", {
    outTradeNo: order.id, // 商户订单号,64个字符以内、可包含字母、数字、下划线,且不能重复
    productCode: "FAST_INSTANT_TRADE_PAY", // 销售产品码，与支付宝签约的产品码名称,仅支持FAST_INSTANT_TRADE_PAY
    totalAmount: order.price.toFixed(2), // 订单总金额，单位为元，精确到小数点后两位
    subject: order.name, // 订单标题
    body: order.desc, // 订单描述
  });

  console.log("formData:", formData, formData.fields[1].value);

  return await alipayPayer.exec(
    device === "h5" ? "alipay.trade.wap.pay" : "alipay.trade.page.pay",
    {},
    { formData: formData }
  );
};


/**
 * 订阅支付成功
 * 1. 修改订单状态
 * 2. 处理订阅
 * @param order
 * @param userId
 */
export const subscriptionPaySuccess = async (
  order: IOrderDTO,
  userId: string | undefined,
  payWay: OrderPayWay = "transfer"
) => {
  // update order status
  const orderResult = await prisma.subscriptionOrder.update({
    where: {
      id: order.id,
    },
    data: {
      status: "paid",
      confirmUserId: userId,
      payTime: new Date(),
      payWay,
    },
    include: {
      rechargePlan: true,
    },
  });

  sendMsgToBot(
    `💰 [星搭收银台 支付成功] 📢 {${ORDER_FROM[order.from] || order.from || ''}} 用户 ${
      order.orderUserId
    } 在 ${payWay} 支付 ${order.price} 元 | 订单id: ${order.id} | ${
      userId ? "审核管理员" + userId : ""
    } 🎉🎉`
  );

  if (order.from !== "mtbird" && order.notifyUrl) {
    await toNoticeUrl(orderResult);
    return orderResult;
  }

  orderResult.version && (await toSubscription(orderResult, userId, payWay));

  return orderResult;
};

export const toNoticeUrl = async (order: any) => {
  try {
    const sign = jwt.sign({ id: order.id }, process.env.JWT_SECRET_CASHIER, {
      expiresIn: "1h",
    });

    const res = await axios.post(order.notifyUrl, {
      sign,
      ...order,
    });

    try {
      if (res.status !== 200 || res.data.code != 200) {
        await prisma.subscriptionOrder.update({ where: { id: order.id }, data: {  notifyFailedReason: res.data.msg || "未知原因"  } })
      }
    } catch (error) {
      console.log("notifyFailedReason failed", error);
    }

    console.log("toNoticeUrl", res);
    return res;
  } catch (e) {
    console.log("[toNoticeUrl] ERRORRRRRRR:", e);
  }
};

export const findSubscriptionOrderByPlatformId = async (platformId: number, size: number, page: number) => {
  const where = {
    rechargePlan: {
      platformId,
    },
  };

  const list = await prisma.subscriptionOrder.findMany({
    where,
    take: size,
    skip: page * size,
    include: {
      user: true,
    }
  });

  list.forEach(item => {
    if (item.user?.phone) {
      (item as any).phone = item.user.phone.replace?.(/^(\d{3})\d{4}(\d+)/,"$1****$2")
    }

    if (item.user) {
      delete (item as any).user;
    }
  })

  const count = await prisma.subscriptionOrder.count({ where });

  return {
    list,
    count,
  };
};


export const getOrderOverview = async (planIdList: string[], year?: number, month?: number) => {
  const result = await prisma.subscriptionOrder.aggregate({
    where: {
      rechargePlanId: {
        in: planIdList
      },
      status: OrderStatus.paid,
    },
    _sum: {
      price: true,
    },
    _count: true,
  });

  const startDate = new Date(new Date().setHours(0, 0, 0, 0));
  const endDate = new Date(new Date().setHours(24, 0, 0, 0));
  const today = await prisma.subscriptionOrder.aggregate({
    where: {
      rechargePlanId: {
        in: planIdList,
      },
      status: OrderStatus.paid,
      createdAt: {
        lte: endDate,
        gte: startDate,
      }
    },
    _sum: {
      price: true,
    },
    _count: true,
  });
  
  return {
    orderCount: result._count,
    orderAmount: result._sum.price,
    todayOrderCount: today._count,
    todayOrderAmount: today._sum.price
  }
}