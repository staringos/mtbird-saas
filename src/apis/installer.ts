import request from "@/utils/request";

export const installer = (config: Record<string, any>) => {
  return request.post("/installer", config);
};