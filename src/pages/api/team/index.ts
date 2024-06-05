import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { getList, add } from "lib/controllers/team";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getList(res, userId);
    case HTTP_METHODS.POST:
      return await add(req, userId, res);
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
