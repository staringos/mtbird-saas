import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { delApp, modify, getApp } from "lib/controllers/app";
import isArray from "lodash/isArray";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let { appId } = req.query;

  let id = isArray(appId) ? appId[0] : appId;

  switch (req.method) {
    case HTTP_METHODS.PUT:
      return await modify(res, userId, id as string, req.body);
    case HTTP_METHODS.DELETE:
      return await delApp(res, userId, id as string);
    case HTTP_METHODS.GET:
      return await getApp(req, res, userId);
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
