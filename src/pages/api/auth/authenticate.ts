import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../../../lib/controllers/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return authenticate(req, res);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
