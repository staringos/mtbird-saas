import request from "@/utils/request";
import { IPageParams, ITemplateDTO } from "@mtbird/shared";

export const addTemplate = (template: ITemplateDTO) => {
  return request.post(`/template`, template);
};

export const getTemplateCategories = () => {
  return request.get(`/template/category`);
};

export const getTemplateList = (
  type: string,
  scope: string,
  teamId: string,
  categoryId: string | undefined,
  pageType: string | undefined,
  pagination: IPageParams
) => {
  return request.get(`/template/${type}`, {
    params: {
      scope,
      teamId,
      categoryId,
      pagination,
      pageType,
    },
  });
};
