import { IPagination } from "@/types/entities/Common";
import { OPERATION_SUCCESS } from "@/utils/messages";
import { generatePagination, generateResponse } from "lib/response";
import unsplash from "lib/unplash";
import { NextApiResponse } from "next";
import prisma from "../prisma";

export const getImageList = async (
  res: NextApiResponse,
  pagination: IPagination
) => {
  const { pageSize, pageNum, query } = pagination;
  const data = await unsplash.search.getPhotos({
    query: query || "",
    page: pageNum,
    perPage: pageSize,
  });
  return res
    .status(200)
    .send(
      generatePagination(
        200,
        OPERATION_SUCCESS,
        data.response?.results,
        pagination,
        data.response?.total
      )
    );
};

export const getTags = async (res: NextApiResponse) => {
  const data = await prisma.imageLibTag.findMany({});
  res.status(200).send(generateResponse(200, OPERATION_SUCCESS, data));
};
