import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { delPage, getPageDetails, modify } from "lib/controllers/page";
import { getFromQuery } from "lib/utils";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let { id, historyId } = req.query;

  // const isPublish = getFromQuery(req, 'isPublish')
  id = getFromQuery(req, "id") as string;
  historyId = getFromQuery(req, "historyId") as string;

  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getPageDetails(res, id, userId, historyId, null, "", false);
    case HTTP_METHODS.PUT:
      return await modify(req, res, userId);
    case HTTP_METHODS.DELETE:
      return await delPage(res, id, userId);
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
