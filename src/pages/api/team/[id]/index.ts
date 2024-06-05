import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { delTeam, modify, getTeam } from "lib/controllers/team";
import isArray from "lodash/isArray";
import { getFromQuery } from "lib/utils";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let id = getFromQuery(req, "id") as string;

  switch (req.method) {
    case HTTP_METHODS.PUT:
      return await modify(res, id, req.body);
    case HTTP_METHODS.DELETE:
      return await delTeam(res, id, userId);
    case HTTP_METHODS.GET:
      return await getTeam(req, res, userId);
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
