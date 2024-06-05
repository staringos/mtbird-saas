import { NOT_PLATFORM_MANAGER } from "@/utils/messages";
import { generateResponse } from "lib/response";
import { isRequestLogined } from "lib/services/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../lib/prisma";

const withPlatformAuthCheck = (handler: any, notloginOnly: boolean = false) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authData = isRequestLogined(req, res, notloginOnly, handler);
      if (!authData) return;

      const teamMember = await prisma.teamMember.findFirst({
        where: {
          memberId: authData.userId,
          teamId: process.env.NEXT_PUBLIC_ADMIN_TEAM,
        },
      });

      // 没有平台管理权限
      if (!teamMember) {
        return res
          .status(401)
          .send(generateResponse(402, NOT_PLATFORM_MANAGER));
      }

      return handler(req, res, authData.userId, authData.teamId);
    } catch (e) {
      res.status(401).send("Please login");
    }
  };
};

export default withPlatformAuthCheck;
