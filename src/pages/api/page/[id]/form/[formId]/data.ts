import type { NextApiRequest, NextApiResponse } from "next";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { HTTP_METHODS } from "@/utils/constants";
import { getPageFormDataList } from "lib/controllers/page";
import { getFromQuery } from "lib/utils";
import { getPaginationParams } from "lib/pagination";
import { generateResponse } from "lib/response";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const pagination = getPaginationParams(req);
  const id = getFromQuery(req, "id");
  const formId = getFromQuery(req, "formId");
  let search = getFromQuery(req, "search");

  try {
    if (search) {
      search = JSON.parse(search);
    }
  } catch (e) {
    search = undefined;
  }

  if (!id || !formId) {
    return res.status(400).send(generateResponse(400, "Params needed"));
  }

  switch (req.method) {
    case HTTP_METHODS.GET:
      return await getPageFormDataList(
        res,
        id as string,
        userId,
        formId,
        pagination,
        search as any
      );
    // case HTTP_METHODS.DELETE:
    //   return await deleteFormData(res, id as string, userId, formId)
  }

  return res.status(405).send(generateResponse(400, "Method not allowed"));
}

export default withAuthCheck(handler);
