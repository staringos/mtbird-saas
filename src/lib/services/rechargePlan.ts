import prisma from "lib/prisma";
import { getPlatformById } from "./platform";
import { OrderPayWay, RechargePlan, SubscriptionOrder } from "@prisma/client";
import { closeUnpaidWecahtOrder, payAlipayV2, payWechatV2, subscriptionPaySuccess } from "./order";
import requestIp from "request-ip";
import { sendMsgToBot } from "lib/sendMsg";

export const getActiveRechargePlanByPlatform = async (platformId: number) => {
  const platform = await getPlatformById(platformId);

  if (!platform) return [];

  return await prisma.rechargePlan.findMany({
    where: {
      isActive: true,
      platformId: platform.id,
    },
  });
};

export const getAllowRechargePlanByPlatform = async (platformId: number, userId?: string) => {
  if (!userId) return getActiveRechargePlanByPlatform(platformId);
  const platform = await getPlatformById(platformId);

  if (!platform) return [];

  const plans = await prisma.rechargePlan.findMany({
    where: {
      isActive: true,
      platformId: platform.id,
    },
  });

  // 找到所有已经购买过的0元订单
  const freeOrder = await prisma.subscriptionOrder.findMany({
    where: {
      rechargePlan: {
        platformId,
        price: 0,
        isActive: true
      },
      orderUserId: userId,
    },
    include: {
      rechargePlan: true,
    }
  });

  // 过滤0元订单对应的充值项
  return plans.filter(item => !freeOrder.find(freeItem => freeItem.rechargePlan?.id === item.id));
};

export const getActiveRechargePlanById = async (id: string) => {
  return await prisma.rechargePlan.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      platform: true,
    },
  });
};

export class SubscriptionError extends Error {
	constructor(message?: string | undefined, options?: ErrorOptions | undefined) {
		super(message, options);
		sendMsgToBot(`⚠️ 收银台支付异常: ${message}`);
	}
}

export const getPlatformPaymentConfig = async (platformId: number) => {

	return await prisma.platformPaymentConfig.findUnique({
		where: {
			platformId: platformId
		}
	})
}

type RechargePlanEntity = Omit<RechargePlan, "id" | "isActive" | "sort">;

export const createRechargePlan = async (data: RechargePlanEntity[], platformId: number) => {
  return await prisma.rechargePlan.createMany({
    data: data.map(item => {
      return {
        ...item,
        platformId
      }
    }),
  })
}


export const modifyRechargePlan = async (platformId: number, newPlans: (RechargePlanEntity & { id?: string })[]) => {
  console.log("🚀 ~ modifyRechargePlan ~ platformId:", platformId)
  console.log("🚀 ~ modifyRechargePlan ~ newPlans:", newPlans)
  const oldPlans = await getActiveRechargePlanByPlatform(Number(platformId));

  // 要添加的方案
  const addPlans = newPlans.filter((item) => !item.id);
  console.log("🚀 ~ modifyRechargePlan ~ addPlans:", addPlans)
  const updatePlans = newPlans.filter((item) => item.id);
  console.log("🚀 ~ modifyRechargePlan ~ updatePlans:", updatePlans)

  await prisma.$transaction(async (tx) => {
    if (updatePlans.length < oldPlans.length) {
      // 要删除的方案
      const removePlans = oldPlans.filter(
        (oldPlan) => !updatePlans.find((item) => item.id === oldPlan.id)
      );
      console.log("🚀 ~ prisma.$transaction ~ removePlans:", removePlans)
      removePlans.length &&
        (await Promise.all(
          removePlans.map((item) =>
            tx.rechargePlan.delete({
              where: {
                id: item.id,
              },
            })
          )
        ));
    }

    addPlans.length &&
      (await tx.rechargePlan.createMany({
        data: addPlans.map(item => {
          return {
            ...item,
            platformId
          }
        }),
      }));

    updatePlans.length &&
      (await Promise.all(
        updatePlans.map(async (item) => {
          const newItem = { ...item };
          delete newItem.id;

          await tx.rechargePlan.update({
            where: {
              id: item.id,
            },
            data: newItem,
          });
        })
      ));
  });
}

export const freeOfPayment = async (order: SubscriptionOrder, payWay: OrderPayWay) => {
  return await subscriptionPaySuccess(order as any, undefined, payWay);
}


export const pay = async (
  device: string,
  plan: RechargePlan,
  payWay: OrderPayWay,
  detectedIp: string,
  userId: string,
  openId?: string
) => {
  const platform: any = await getPlatformById(plan.platformId);
  const platformPaymentConfig = platform?.platformPaymentConfig as any;
	
  try {
    await closeUnpaidWecahtOrder(userId);
  } catch (error) {
  }

  // 1. 创建订单
  const orderAdd = await prisma.subscriptionOrder.create({
    // TODO type error
    // @ts-ignore
    data: {
      orderUserId: userId,
      price: plan.price,
      name: plan.name,
      desc: plan.desc || plan.name,
      returnUrl: platformPaymentConfig?.returnUrl,
      notifyUrl: platformPaymentConfig?.notifyUrl,
      from: platform?.key || "--",
			rechargePlanId: plan.id,
    },
  });

  let result;

  if (orderAdd.price.equals(0)) {
    // freeOfPayment  
    const order = await freeOfPayment(orderAdd, payWay)
    return {
      isFree: true,
      order,
      paymentResult: order.returnUrl
    };
  }

  // 2. 创建支付
  switch (payWay) {
    case OrderPayWay.alipay: {
      result = await payAlipayV2(device, orderAdd, platformPaymentConfig?.returnUrl!);
      break;
    }

    case OrderPayWay.wechat: {
      
      try {
				result = await payWechatV2(
					device,
					orderAdd,
					detectedIp as string,
					openId
				);
			} catch (error: any) {
				throw new SubscriptionError(error.message);
			}
      break;
    }

    default:
      throw new SubscriptionError("支付方式错误");
  }

  return {
		paymentResult: result,
		order: orderAdd,
	};
};
