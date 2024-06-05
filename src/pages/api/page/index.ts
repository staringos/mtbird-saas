import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import isArray from "lodash/isArray";

import { getPageListByAppId, add } from "lib/controllers/page";
import { generateResponse } from "lib/response";
import { APP_NO_APP_ID } from "@/utils/messages";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let appId = req.query.appId;

  if (!appId) return res.status(404).send(generateResponse(404, APP_NO_APP_ID));

  appId = isArray(appId) ? appId[0] : appId;

  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getPageListByAppId(res, userId, appId);
    case HTTP_METHODS.POST:
      return await add(res, userId, appId, req.body);
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
