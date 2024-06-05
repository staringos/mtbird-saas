import axios from "axios";
import { IResponse } from "types/entities/Common";
import { AUTH_TOKEN } from "./constants";
import get from "lodash/get";
import Cookies from "js-cookie";
import { nanoid } from "nanoid";

const getToken = () => {
  let token = Cookies.get("t") || localStorage.getItem(AUTH_TOKEN);
  if (!token) {
    const t = Cookies.get("t");
    if (t) {
      token = t;
      localStorage.setItem(AUTH_TOKEN, token);
    }
  }

  return token;
}

interface IRequest {
  get: (url: string, data?: Record<string, any>) => Promise<IResponse>;
  post: (url: string, data?: Record<string, any>) => Promise<IResponse>;
  put: (url: string, data?: Record<string, any>) => Promise<IResponse>;
  delete: (url: string, data?: Record<string, any>) => Promise<IResponse>;
  interceptors: any;
}

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response.status === 401) {
      if (location.pathname !== "/auth/login") {
        return (location.href = `/auth/login?redirectUrl=${encodeURIComponent(location.href)}`);
      } else {
        return;
      }
    }

    const err: any = new Error(get(error, "response.data.msg"));
    err.code = get(error, "response.data.code");
    err.data = get(error, "response.data.data");

    throw err;
  }
);

request.interceptors.request.use((config) => {

  if (config.headers) {
    config.headers['x-apigw-nonce'] = nanoid(12);
  }

  const token = getToken();
  if (config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
})

export const setAuthorization = (token: string) => {
  request.defaults.headers.common = {
    Authorization: "Bearer " + token,
  };
};

if (typeof window !== "undefined") {
  const token = getToken();
  if (token && token.length > 0) setAuthorization(token);
}

export default request as IRequest;
