import request from "@/utils/request";
import axios from "axios";

export const installer = (config: Record<string, any>) => {
  return request.post("/installer", {
    env: config
  });
};

export const getActivationStatus = () => {
  return axios.get(`/api/sp/platform?domain=${location.host}`).then(res => res.data);
}

export const activation = (data: { code: string, domain: string }) => {
  return axios.post(`/api/sp/platform/activation`, data).then(res => res.data);
}