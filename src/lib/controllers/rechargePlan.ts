import { OPERATION_SUCCESS, RESOURCE_NOT_FIND } from "@/utils/messages";
import { OrderStatus } from "@prisma/client";
import prisma from "lib/prisma";
import { generateResponse } from "lib/response";
import {
  SubscriptionError,
  getActiveRechargePlanById,
  getActiveRechargePlanByPlatform,
  pay,
} from "lib/services/rechargePlan";
import { getFromBody, getFromQuery } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";

export const getRechargePlan = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const platform = Number(getFromQuery(req, "platform")) || -1;

  const plan = await getActiveRechargePlanByPlatform(platform);

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, plan));
};

export const payController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const openId = getFromBody(req, "openId");
  const payWay = getFromBody(req, "payWay");
  const device = getFromBody(req, "device");
  const planId = getFromQuery(req, "planId");

  const detectedIp = requestIp.getClientIp(req);

  if (!planId) {
    return res.status(404).send(generateResponse(404, "订单未找到"));
  }

  const plan = await getActiveRechargePlanById(planId);
  if (!plan) return res.status(404).send(generateResponse(404, "订单未找到"));

  try {
    const { order, paymentResult, isFree } = await pay(
      device,
      plan,
      payWay,
      detectedIp!,
      userId,
      openId
    );

    return res.status(200).send(
      generateResponse(200, OPERATION_SUCCESS, {
        url: paymentResult,
        orderId: order?.id,
        isFree
      })
    );
  } catch (error) {
    console.log("🚀 ~ error:", error)
    if (error instanceof SubscriptionError) {
      return res.status(400).send(generateResponse(400, error.message));
    }

    return res.status(400).send(generateResponse(400, "支付失败，请稍后再试"));
  }
};
