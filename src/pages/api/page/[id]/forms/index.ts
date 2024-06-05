import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { getPageFormList } from "lib/controllers/page";
import isArray from "lodash/isArray";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  let { id } = req.query;

  id = isArray(id) ? id[0] : id;

  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getPageFormList(res, id as string, userId);
  }

  return res.status(405).send("Method not allowed");
}

export default withAuthCheck(handler);
