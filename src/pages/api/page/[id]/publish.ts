import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { publishPage } from "lib/controllers/page";
import { getFromBody, getFromQuery } from "lib/utils";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const id = getFromQuery(req, "id");
  const avatar = getFromBody(req, "avatar");

  switch (req.method) {
    case HTTP_METHODS.POST:
       const result = await publishPage(res, id as string, userId, avatar);
       return res.status(result?.code!).send(result)
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
