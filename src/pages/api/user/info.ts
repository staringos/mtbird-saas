import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { getUserInfo, updateUserProfile } from "lib/controllers/user";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  _teamId: string,
  v: string
) {
  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getUserInfo(res, userId, v);
    case HTTP_METHODS.PUT:
      return await updateUserProfile(req, res, userId);
  }
}

export default withAuthCheck(handler);
