import type { NextApiRequest, NextApiResponse } from "next";
import { sendCode } from "../../../../lib/controllers/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return sendCode(res, req.body.phone);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
