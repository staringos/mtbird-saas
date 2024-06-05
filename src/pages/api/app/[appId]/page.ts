import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import isArray from "lodash/isArray";

import { getPageListByAppId, add } from "lib/controllers/page";

async function pageHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let { appId } = req.query;

  appId = isArray(appId) ? appId[0] : appId;

  switch (req.method) {
    case HTTP_METHODS.GET:
      return res
        .status(200)
        .send(await getPageListByAppId(res, userId, appId as string));
    case HTTP_METHODS.POST:
      return res
        .status(200)
        .send(await add(res, appId as string, userId, req.body));
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(pageHandler);
