import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_METHODS } from "@/utils/constants";
import { getImageList } from "lib/controllers/imagelib";
import { getPaginationParams } from "lib/pagination";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const pagination = getPaginationParams(req);

  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getImageList(res, pagination);
  }

  return res.status(405).send("Method not allowed");
}

export default handler;
