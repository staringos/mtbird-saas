import type { NextApiRequest, NextApiResponse } from "next";
import { verify } from "../../../lib/controllers/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return verify(req, res, req.body.phone, req.body.code, req.body.to, req.body.appId, req.body.registryInfo);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
