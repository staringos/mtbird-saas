import { getFromQuery } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "../../../../lib/controllers/extension";
import withAuthCheck from "@/middlewares/withAuthCheck";

function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const teamId = getFromQuery(req, "teamId") as string;
  switch (req.method) {
    case "POST":
      return getToken(res, userId, teamId, req.body);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuthCheck(handler);
