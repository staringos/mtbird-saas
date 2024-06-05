import { IPagination } from "@/types/entities/Common";
import request from "@/utils/request";

export const addFormData = (pageId: string, formId: string, formData: any) => {
  return request.post(`/page/${pageId}/form`, {
    data: formData,
    formId: formId,
  });
};

export const getForms = (pageId: string) => {
  return request.get(`/page/${pageId}/forms`);
};

export const getForm = (pageId: string, formId: string) => {
  return request.get(`/page/${pageId}/form/${formId}`);
};

export const getFormData = (
  pageId: string,
  formId: string,
  pagination: IPagination,
  search?: Record<string, any>
) => {
  return request.get(`/page/${pageId}/form/${formId}/data`, {
    params: {
      search,
      ...pagination,
    },
  });
};

export const deleteFormData = (
  pageId: string,
  formId: string,
  dataId: string | number
) => {
  return request.delete(`/page/${pageId}/form/${formId}`, {
    params: {
      dataId,
    },
  });
};
