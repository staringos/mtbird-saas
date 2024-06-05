import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";

import { getAuthorization } from "lib/controllers/xunfei";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  switch (req.method) {
    case HTTP_METHODS.POST:
      return res.status(200).send(getAuthorization(req.headers.origin!));
  }

  return res.status(405).send("Method not allowed");
}

export default handler;
