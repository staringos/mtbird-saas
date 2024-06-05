import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { validateSessionByAccessIdentifier } from "lib/services/auth";
import { generateResponse } from "lib/response";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  _teamId: string,
  v: string
) {
  switch (req.method) {
    case HTTP_METHODS.GET: {
      // if (!(await validateSessionByAccessIdentifier(userId, v))) {
      //   return res.status(401).send("Please login");
      // }

      return res.status(200).send(generateResponse(200, ""));
    }
  }
}

export default withAuthCheck(handler);
