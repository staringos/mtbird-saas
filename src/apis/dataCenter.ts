import request from "@/utils/request";
import { IPageParams } from "@mtbird/shared/dist/types";

export const getDataModels = (teamId: string) => {
  return request.get(`/dataCenter/dataTable/model?teamId=${teamId}`);
};

export const getDataModelFields = (modelId: string) => {
  return request.get(`/dataCenter/dataTable/model/${modelId}/field`);
};

export const getDataModelData = (
  modelId: string,
  pagination: IPageParams,
  search: Record<string, any>
) => {
  return request.get(`/dataCenter/dataTable/model/${modelId}/data`, {
    params: {
      search,
      ...pagination,
    },
  });
};

export const getDataModelDataDetail = (
  modelId: string,
  search: Record<string, any>
) => {
  return request.post(`/dataCenter/dataTable/model/${modelId}/dataDetail`, {
    search,
  });
};

export const deleteDataModelData = (targetId: string, dataId: string) => {
  return request.delete(
    `/dataCenter/dataTable/model/${targetId}/data/${dataId}`
  );
};

export const addDataModel = (teamId: string, name: string) => {
  return request.post(`/dataCenter/dataTable/model`, {
    teamId,
    name,
  });
};

export const addDataModelField = (
  modelId: string,
  data: Record<string, any>
) => {
  return request.post(`/dataCenter/dataTable/model/${modelId}/field`, data);
};

export const updateDataModelField = (
  modelId: string,
  fieldId: string,
  data: Record<string, any>
) => {
  return request.put(
    `/dataCenter/dataTable/model/${modelId}/field/${fieldId}`,
    data
  );
};

export const deleteDataModel = () => {
  return request.delete(`/dataCenter/dataTable/model`);
};

export const deleteDataModelField = (modelId: string, fieldId: string) => {
  return request.delete(
    `/dataCenter/dataTable/model/${modelId}/field/${fieldId}`
  );
};

export const updateModalField = (
  modelId: string,
  fieldId: string,
  data: Record<string, any>
) => {
  return request.delete(
    `/dataCenter/dataTable/model/${modelId}/field/${fieldId}`
  );
};

export const addDataModelData = (
  modelId: string,
  data: Record<string, any>
) => {
  return request.post(`/dataCenter/dataTable/model/${modelId}/data`, {
    data,
  });
};

export const modifyDataModelData = (
  modelId: string,
  dataId: string,
  data: Record<string, any>
) => {
  return request.put(`/dataCenter/dataTable/model/${modelId}/data/${dataId}`, {
    data,
  });
};
