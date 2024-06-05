import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { deleteHistory } from "lib/controllers/extension";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  teamId: string
) {
  switch (req.method) {
    case HTTP_METHODS.DELETE:
      return await deleteHistory(res, userId, teamId, req.body);
  }

  return res.status(405).send("Method not allowed, please add token");
}

export default withAuthCheck(handler);
