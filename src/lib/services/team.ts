import { NO_AUTH } from "@/utils/messages";
import { generateResponse } from "lib/response";
import { NextApiResponse } from "next";
import prisma from "../prisma";

export const getTeamAppNumber = async (teamId: string) => {
  return await prisma.application.count({
    where: {
      teamId,
      status: {
        not: -1,
      },
    },
  });
};

/**
 * Check if userId has auth to query & modify this app from this team
 * @param res
 * @param userId
 * @param teamId
 * @returns
 */
export const teamCheck = async (
  res: NextApiResponse,
  userId: string,
  teamId: string
) => {
  const teamMemberShip = await prisma.teamMember.findFirst({
    where: {
      memberId: userId,
      teamId,
      team: {
        NOT: {
          status: -1,
        },
      },
    },
  });

  if (!teamMemberShip) {
    res.status(422).send(generateResponse(422, NO_AUTH));
    return false;
  }
  return true;
};
