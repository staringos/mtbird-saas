import { generateResponse } from "lib/response";
import { teamCheck } from "lib/services/team";
import { getFromQuery } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

const withAuthCheck = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
    const teamId = getFromQuery(req, "teamId") as string;

    if (!teamId)
      return res.status(400).send(generateResponse(400, "Team not found"));

    if (await teamCheck(res, userId, teamId))
      return handler(req, res, userId, teamId);
  };
};

export default withAuthCheck;
