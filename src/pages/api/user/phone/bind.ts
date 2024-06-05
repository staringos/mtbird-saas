import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { bindPhone } from "lib/controllers/user";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  switch (req.method) {
    case HTTP_METHODS.POST:
      return await bindPhone(req, res, userId);
  }
}

export default withAuthCheck(handler);
