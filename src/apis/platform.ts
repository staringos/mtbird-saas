import request from "../utils/request";
import { IPageParams } from "@mtbird/shared/dist/types";

export const changeTemplatePrivate = (id: string, isPrivate: boolean) => {
  return request.post(
    `/platform/template/${id}/changePrivate?isPrivate=${isPrivate}`
  );
};

export const modifyTemplate = (id: string, data: any) => {
  return request.put(`/platform/template/${id}`, data);
};

export const getTemplateDetails = (id: string) => {
  return request.get(`/platform/template/${id}`);
};

export const getPlatformOrderList = (pagination: IPageParams) => {
  return request.get(`/platform/order`, {
    params: {
      ...pagination,
    },
  });
};

export const getUserList = (pagination: IPageParams) => {
  return request.get(`/platform/user`, {
    params: {
      ...pagination,
    },
  });
};

export const getTemplateList = (pagination: IPageParams) => {
  return request.get(`/platform/template`, {
    params: {
      ...pagination,
    },
  });
};

export const confirmOrder = (orderId: string) => {
  return request.post(`/platform/order/${orderId}/confirm`);
};

export const closeOrder = (orderId: string) => {
  return request.post(`/platform/order/${orderId}/close`);
};

export const getUserDetails = (userId: string) => {
  return request.get(`/platform/user/${userId}`);
};
