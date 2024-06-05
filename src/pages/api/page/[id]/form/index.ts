import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_METHODS } from "@/utils/constants";
import { addFormData } from "lib/controllers/page";
import isArray from "lodash/isArray";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query;

  id = isArray(id) ? id[0] : (id as string);

  switch (req.method) {
    case HTTP_METHODS.POST:
      return await addFormData(res, id, {
        ...req.body,
        userAgent: req.headers["user-agent"],
      });
  }

  return res.status(405).send("Method not allowed");
}

export default handler;
