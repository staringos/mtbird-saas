import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_METHODS } from "@/utils/constants";
import { getTags } from "lib/controllers/imagelib";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getTags(res);
  }

  return res.status(405).send("Method not allowed");
}

export default handler;
