import request from "@/utils/request";
import { IPageParams } from "@mtbird/shared/dist/types";

export const getAssistant = (pagination: IPageParams, query?: string) => {
  return request.get(`/ai/assistant/public`, {
    params: {
      ...pagination,
      query,
    },
  });
};

export const getAssistantList = (type: string, pagination: any) => {
  return request.get("/ai/local/assistant", { params: { type, ...pagination } });
};
