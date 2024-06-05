import { getPaginationParams, paginationFind } from "lib/pagination";
import prisma from "lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export const getAppTemplates = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const pagination = getPaginationParams(req);

  const condition: Record<string, any> = {
    NOT: {
      isDelete: true,
    },
  };

  return res.status(200).send(
    await paginationFind(
      prisma.applicationTemplate,
      pagination,
      condition,
      null,
      [
        {
          sort: "asc",
        },
      ]
    )
  );
};
