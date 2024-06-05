import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_METHODS } from "@/utils/constants";
import { getPageDetails } from "lib/controllers/page";
import { getFromQuery } from "lib/utils";
import { generateResponse } from "lib/response";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const id = getFromQuery(req, "id") as string;
  const historyId = getFromQuery(req, "historyId") as string;
  const appId = getFromQuery(req, "appId") as string;
  const domain = getFromQuery(req, "domain") as string;
  const routeKey = getFromQuery(req, 'routeKey') as string;

  if (routeKey && !id) {
    return res.status(400).send(generateResponse(400, "Params needed"));
  }

  let idParam: any = id;
  if (routeKey) {
    idParam = {
      appId: id,
      routeKey
    }
  }

  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getPageDetails(
        res,
        idParam,
        userId,
        historyId,
        appId,
        domain,
        true,
        true
      );
  }

  return res.status(405).send("Method not allowed");
}

export default handler;
