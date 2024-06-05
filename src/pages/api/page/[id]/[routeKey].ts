import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { delPage, getPageDetails, modify } from "lib/controllers/page";
import { getFromQuery } from "lib/utils";
import { generateResponse } from "lib/response";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let { id, historyId, routeKey } = req.query;

  id = getFromQuery(req, "id") as string;
  historyId = getFromQuery(req, "historyId") as string;
	routeKey = getFromQuery(req, "routeKey") as string;

  if (!id || !routeKey) {
    return res.status(400).send(generateResponse(400, "Params needed"));
  }


  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getPageDetails(res, { appId: id, routeKey }, userId, historyId, null, "", false);
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
