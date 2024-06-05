import { IOrderDTO } from "@/types/entities/Order";
import { TeamVersion } from "@/types/entities/Team";
import { TEAM_VERSIONS_DICT } from "@/utils/constants";
import prisma from "lib/prisma";
import { sendMsgToBot } from "lib/sendMsg";

export const toSubscription = async (
  order: any,
  userId: string | undefined,
  payWay: string
) => {
  sendMsgToBot(
    `📄 [星搭云AI无代码平台] 📢 开通会员: ${payWay} 到账 ${order.price} 元 | ${
      TEAM_VERSIONS_DICT[order.version]
    } ${order.times} ${order.period === "monthly" ? "月" : "年"} | id: ${
      order.id
    } | ${userId ? "审核管理员" + userId : ""} 🎉🎉`
  );

  // update user version
  await prisma.team.update({
    data: {
      version: order.version as TeamVersion,
    },
    where: {
      id: order.teamId,
    },
  });
};
