import type { NextApiRequest, NextApiResponse } from "next";
import withNextCors from "@/middlewares/withNextCors";
import { HTTP_METHODS } from "@/utils/constants";
import { getBasicPublicUserInfo } from "lib/controllers/user";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getBasicPublicUserInfo(req, res);
  }
}

export default withNextCors(handler);
