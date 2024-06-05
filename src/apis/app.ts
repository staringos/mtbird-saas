import { IApplication, IDomainDTO } from "@/types/entities/Application";
import request from "@/utils/request";

export const addApp = (
  teamId: string,
  { name, avatar, desc, type, templateId, metadata }: IApplication
) => {
  return request.post(`/app?teamId=${teamId}`, {
    name,
    avatar,
    desc,
    type,
    templateId,
    metadata: JSON.stringify(metadata)
  });
};

export const getApplicationsByTeamId = (teamId: string) => {
  return request.get(`/app?teamId=${teamId}`);
};

export const getApplication = (appId: string) => {
  return request.get(`/app/${appId}`);
};

export const deleteApplication = (appId: string) => {
  return request.delete(`/app/${appId}`);
};

export const bindDomain = (appId: string, domain: IDomainDTO) => {
  return request.post(`/app/${appId}/domain`, domain);
};

export const changeAppDetails = (
  appId: string,
  data: { name: string; desc: string; avatar: string }
) => {
  return request.put(`/app/${appId}/details`, data);
};

export const getAppTemplates = () => {
  return request.get(`/app/templates`);
};
