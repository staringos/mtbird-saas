import type { NextApiRequest, NextApiResponse } from "next";
import { visitorToken } from "lib/controllers/visitor";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return visitorToken(req, res);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
