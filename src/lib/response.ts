import { IPagination } from "@/types/entities/Common";

export const generateResponse = (
  code: number,
  msg: string,
  data?: Record<string, any> | null
) => {
  return {
    code,
    msg,
    data,
  };
};

export const generatePagination = (
  code: number,
  msg: string,
  data: Record<string, any> | null | undefined,
  pagination: IPagination,
  total: number = 0
) => {
  return {
    ...pagination,
    code,
    msg,
    data,
    total,
  };
};
