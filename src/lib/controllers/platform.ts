import {
  OPERATION_SUCCESS,
  ORDER_STATUS_ERROR,
  PARAMS_ERROR,
  RESOURCE_NOT_FIND,
} from "@/utils/messages";
import { generateResponse } from "lib/response";
import { NextApiRequest, NextApiResponse } from "next/types";
import prisma from "../prisma";
import { getPaginationParams, paginationFind } from "lib/pagination";
import { getFromBody, getFromQuery } from "lib/utils";
import {
  findSubscriptionOrderByPlatformId,
  getOrderOverview,
  subscriptionPaySuccess,
} from "lib/services/order";
import {
  createRechargePlan,
  getActiveRechargePlanByPlatform,
  getAllowRechargePlanByPlatform,
  getPlatformPaymentConfig,
  modifyRechargePlan,
} from "lib/services/rechargePlan";
import { createPlatformPaymentConfig, createStaringOSPlatform, getPlatformById } from "lib/services/platform";
import { Decimal } from "@prisma/client/runtime";

export const getTemplateDetailsController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const data = await prisma.template.findFirst({
    where: {
      id,
    },
  });

  if (!data)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};

export const modifyTemplateController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const name = getFromBody(req, "name") as string;
  const desc = getFromBody(req, "desc") as string;
  const pageType = getFromBody(req, "pageType") as string;
  const type = getFromBody(req, "type") as string;
  const avatar = getFromBody(req, "avatar") as string;
  const componentName = getFromBody(req, "componentName") as string;
  const content = getFromBody(req, "content") as any;

  const data = await prisma.template.findFirst({
    where: {
      id,
    },
  });

  if (!data)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  const result = await prisma.template.update({
    data: {
      ...data,
      name,
      desc,
      pageType,
      type,
      avatar,
      componentName,
      content,
    },
    where: {
      id,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, result));
};

export const changeTemplatePrivate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;
  const isPrivate = getFromQuery(req, "isPrivate") as string;

  const data = await prisma.template.findFirst({
    where: {
      id,
    },
  });

  if (!data)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  const result = await prisma.template.update({
    data: {
      isPrivate: isPrivate === "true" ? true : false,
    },
    where: {
      id,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, result));
};

export const getUserDetails = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const id = getFromQuery(req, "id") as string;

  const data = await prisma.user.findFirst({
    include: {
      Team: true,
      Application: true,
      Page: true,
      SubscriptionOrder: true,
      UserLoginLog: true,
    },
    where: {
      id,
    },
  });

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};

export const getPlatformOrderList = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const pagination = getPaginationParams(req);
  const data = await paginationFind(
    prisma.subscriptionOrder,
    pagination,
    {},
    {
      user: {
        select: {
          nickname: true,
          avatar: true,
        },
      },
      // team: {
      //   select: {
      //     name: true,
      //     avatar: true,
      //   },
      // },
    },
    [{ updatedAt: "desc" }]
  );

  const result = await Promise.all(
    data.data?.map(async (cur: any) => {
      if (cur.teamId) {
        cur.team = await prisma.team.findFirst({
          where: {
            id: cur.teamId,
          },
        });
      }

      return cur;
    })
  );

  return res.status(200).send({ ...data, data: result });
};

export const getUserList = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const pagination = getPaginationParams(req);
  return res.status(200).send(
    await paginationFind(
      prisma.user,
      pagination,
      {},
      {
        _count: {
          select: {
            Team: true,
            Application: true,
            Page: true,
            SubscriptionOrder: true,
            UserLoginLog: true,
          },
        },
        UserWechatInfo: {
          select: {
            nickname: true,
            headImage: true,
          },
        },
        UserLoginLog: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      [{ createdAt: "desc" }]
    )
  );
};

export const confirmOrder = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const orderId = getFromQuery(req, "id");
  const order = await prisma.subscriptionOrder.findFirst({
    where: { id: orderId },
  });

  if (!order)
    return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));
  if (order.status !== "confirming")
    return res.status(400).send(generateResponse(400, ORDER_STATUS_ERROR));

  await subscriptionPaySuccess(order as any, userId);
  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getTemplateList = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const pagination = getPaginationParams(req);
  const where = getFromQuery(req, "search") || {};

  return res.status(200).send(
    await paginationFind(
      prisma.template,
      pagination,
      where,
      {
        User: {
          select: {
            nickname: true,
            avatar: true,
          },
        },
        Team: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      [{ createdAt: "desc" }]
    )
  );
};

export const getPlatformConfig = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const platformId = getFromQuery(req, "platformId");

  if (!platformId)
    return res.status(400).send(generateResponse(404, PARAMS_ERROR));

  const result = await getPlatformPaymentConfig(Number(platformId));

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, result));
};

export const createStaringOSPlatformController = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const name = getFromBody(req, "name");
  const desc = getFromBody(req, "desc");
  const key = getFromBody(req, "key");
  const notifyUrl = getFromBody(req, "notifyUrl");
  const returnUrl = getFromBody(req, "returnUrl");

  if (!name || !key) {
    return res.status(400).send(generateResponse(400, PARAMS_ERROR));
  }

  const platform = await createStaringOSPlatform(name, desc, key);

  await createPlatformPaymentConfig(platform.id, undefined, returnUrl, notifyUrl)

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, platform));
};

export const createRechargePlanController = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const platformId = getFromQuery(req, "platformId");
  const plans = getFromBody(req, "plans", false);
  // const name = getFromBody(req, "name");
  // const desc = getFromBody(req, "desc");
  // const platformId = Number(getFromBody(req, "platformId"));
  // const value = Number(getFromBody(req, "value"));
  // const price = getFromBody(req, "price");
  // const durationType = getFromBody(req, "durationType");
  // const type = getFromBody(req, "type");
  // const originalPrice = getFromBody(req, "originalPrice");
  // const unit = getFromBody(req, "unit");

  try {
    const plan = await createRechargePlan(plans, Number(platformId));

    return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, plan));
  } catch (error: any) {
    return res
      .status(500)
      .send(generateResponse(500, error.message || "platform创建错误"));
  }
};

export const modifyRechargePlanController = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const platformId = getFromQuery(req, "platformId");
  console.log("🚀 ~ platformId:", platformId);
  const newPlans = getFromBody(req, "plans", false);
  console.log("🚀 ~ newPlans:", newPlans);

  await modifyRechargePlan(Number(platformId), newPlans);

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS));
};

export const getRechargePlanController = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const platformId = getFromQuery(req, "platformId") as string;

  if (!platformId) return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, []));

  const plans = await getAllowRechargePlanByPlatform(Number(platformId));

  return res.status(200).send(generateResponse(200, OPERATION_SUCCESS, plans));

}

export const getRechargePlanOrder = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const platformId = Number(getFromQuery(req, "platformId"));
  const size = Number(getFromQuery(req, "size"));
  const page = Number(getFromQuery(req, "page"));

  const { list, count } = await findSubscriptionOrderByPlatformId(
    platformId,
    size,
    page
  );

  console.log("🚀 ~ count:", count, platformId, list)

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, { list, count }));
};


export const getOrderOverviewCtrl = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const platformId = getFromQuery(req, "platformId");
  const year = getFromQuery(req, "year") || undefined;
  const month = getFromQuery(req, "month") || undefined;

  if (!platformId) return res.status(404).send(generateResponse(404, RESOURCE_NOT_FIND));

  const platform: any = await getPlatformById(Number(platformId), {
    rechargePlan: true,
  });

  const planIdList = platform?.rechargePlan.map((item: any) => item.id);

  if (!planIdList)  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, {}));

  const result = await getOrderOverview(planIdList, year ? Number(year) : undefined, month ? Number(month) : undefined);

  return res
    .status(200)
    .send(generateResponse(200, OPERATION_SUCCESS, result));
}