import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import isArray from "lodash/isArray";

import { getListByTeamId, add } from "lib/controllers/app";
import { generateResponse } from "lib/response";
import { APP_NO_TEAM_ID } from "@/utils/messages";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let teamId = req.query.teamId;

  if (!teamId)
    return res.status(404).send(generateResponse(404, APP_NO_TEAM_ID));
  teamId = isArray(teamId) ? teamId[0] : teamId;

  switch (req.method) {
    case HTTP_METHODS.GET:
      return res.status(200).send(await getListByTeamId(res, userId, teamId));
    case HTTP_METHODS.POST:
      return res.status(200).send(await add(res, userId, teamId, req.body));
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
