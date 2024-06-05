import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prisma";
import { generateResponse } from "lib/response";
import { AI_LIMIT_EXCEEDED } from "@/utils/messages";

const withAIUsageCheck = (handler: any, type: string) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    userId: string,
    teamId: string
  ) => {
    let teamLimit = await prisma.aITeamUsage.findFirst({
      where: {
        teamId: teamId,
      },
    });

    if (!teamLimit) {
      teamLimit = await prisma.aITeamUsage.create({
        data: {
          teamId: teamId,
          latestModifyUserId: userId,
        },
      });
    }

    const isUnderLimit =
      (teamLimit as any)?.[`${type}UsageNum`] <
      (teamLimit as any)?.[`${type}LimitedNum`];

    if (isUnderLimit) {
      return handler(req, res, userId, teamId, teamLimit);
    }

    res.status(400).send(generateResponse(400, AI_LIMIT_EXCEEDED));
  };
};

export default withAIUsageCheck;
