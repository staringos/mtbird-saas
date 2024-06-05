import { IPagination } from "@/types/entities/Common";
import toNumber from "lodash/toNumber";
import isNaN from "lodash/isNaN";
import { NextApiRequest } from "next";
import { getFromQuery } from "./utils";
import { OPERATION_SUCCESS } from "@/utils/messages";
import { generatePagination } from "./response";

export const DEFAULT_PAGE_NUM = 1;
export const DEFAULT_PAGE_SIZE = 10;

export const getPaginationParams = (req: NextApiRequest) => {
  let pageNumStr = getFromQuery(req, "pageNum") || DEFAULT_PAGE_NUM;
  let pageSizeStr = getFromQuery(req, "pageSize") || DEFAULT_PAGE_SIZE;
  const query = getFromQuery(req, "query");

  if (isNaN(pageNumStr)) pageNumStr = DEFAULT_PAGE_NUM;
  if (isNaN(pageSizeStr)) pageSizeStr = DEFAULT_PAGE_SIZE;

  const pageNum = toNumber(pageNumStr);
  const pageSize = toNumber(pageSizeStr);

  return {
    pageNum,
    pageSize,
    query,
  } as IPagination;
};

export const wrapPaginationSearch = (
  pagination: IPagination,
  where: any,
  include?: any,
  orderBy?: any
) => {
  return {
    skip: (pagination.pageNum - 1) * pagination.pageSize,
    take: pagination.pageSize,
    where,
    include,
    orderBy,
  };
};

export const paginationFind = async (
  entity: any,
  pagination: IPagination,
  where: any,
  include?: any,
  orderBy?: any
) => {
  const data = await entity.findMany(
    wrapPaginationSearch(pagination, where, include, orderBy)
  );
  const total = await entity.count({
    where,
  });

  return generatePagination(200, OPERATION_SUCCESS, data, pagination, total);
};
