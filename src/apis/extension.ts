import request from "@/utils/request";

export const getExtensionToken = (teamId: string) => {
  return request.post(`/registry/${teamId}/auth`);
};

export const getExtensions = (appId: string) => {
  return request.get(`/app/${appId}/extension`);
};

export const getExtensionManageList = (teamId: string) => {
  return request.get(`/extensions?teamId=${teamId}`);
};
