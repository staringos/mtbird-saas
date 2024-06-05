import { IRegistryInfo } from "@/types/entities/User";
import request from "@/utils/request";
import { IComponentInstance, IPageConfig } from "@mtbird/shared/dist/types";
import get from "lodash/get";
import { IPage } from "types/entities/Page";

export const sendCode = (phone: string) => {
  return request.post("/auth/code", { phone });
};

export const verifyCode = (phone: string, code: string, to: string, appId: string, registryInfo?: IRegistryInfo) => {
  return request.post("/auth/verify", { phone, code, to, appId, registryInfo });
};


export const weixinAuthorize = (code: string, to: string, appId: string, state: string, registryInfo?: IRegistryInfo) => {
  return request.post("/auth/weixin", { code, to, appId, registryInfo, state });
};


export const mpAuthorize = (code: string, to: string, appId: string, registryInfo?: IRegistryInfo) => {
  return request.post("/auth/weixin/mp", { code, to, appId, registryInfo });
};


export const workWeixinAuthorize = (code: string, to: string, appId: string, state: string, registryInfo?: IRegistryInfo) => {
  return request.post("/auth/work-weixin", { code, to, appId, registryInfo, state });
};

export const weixinBind = (code: string, state: string) => {
  return request.post("/auth/weixin/bind", { code, state });
};

export const login = (username: string, password: string, to: string, appId: string) => {
  return request.post("/auth/authenticate", { username, password, to, appId });
};

export const getUserInfo = () => {
  return request.get("/user/info");
};

export const getPageByAppId = (appId: string) => {
  return request.get(`/page?appId=${appId}`);
};

export const addTeam = ({ name, avatar }: { name: string; avatar: string }) => {
  return request.post(`/team`, { name, avatar });
};

export const addPage = (
  appId: string,
  { title, avatar, desc, type }: IPage,
  pageData: IComponentInstance
) => {
  return request.post(`/page?appId=${appId}`, {
    title,
    avatar,
    desc,
    type,
    content: pageData,
  });
};

export const modifyPage = (
  pageId: string,
  { title, avatarShare, tags, desc, type }: IPage
) => {
  return request.put(`/page/${pageId}`, {
    title,
    avatarShare,
    tags,
    desc,
    type,
  });
};

export const getPageDetails = (page: string | {
  appId: string,
  routeKey: string,
}) => {
  let promise = null;
  if (typeof page !== 'string') {
    promise = getPageDetailsByRouteKey(page.appId, page.routeKey)
  } else {
    promise = request.get(`/page/${page}`);
  }

  return promise.then(result => {
    saveAppInfo(result);
    return result;
  });
};

const saveAppInfo = (result: any) => {
  try {
    const appMetadata = get(result, "data.appMetadata");
    const app = get(result, "data.app");
    localStorage.setItem("CURRENT_APP_METADATA", JSON.stringify(appMetadata));

    localStorage.setItem(`CURRENT_APP`, JSON.stringify(app));
    } catch (error) {
      console.warn('app信息保存错误', error)
    }
  }


export const getPageDetailsByRouteKey = (appId: string, routeKey: string) => {
  return request.get(`/page/${appId}/${routeKey}`);
}

export const getPagePublished = (
  page: string | {
    appId: string,
    routeKey: string,
  },
  appId: string,
  domain: true
) => {
  let promise = null;
  if (typeof page === 'string') {
    promise = request.get(
      `/page/${page}/published?appId=${appId}&domain=${domain}`
    );
  } else {
    promise =  request.get(
      `/page/${page.appId}/published?appId=${appId}&domain=${domain}&routeKey=${page.routeKey}`
    );
  }

  return promise.then(result => {
    saveAppInfo(result);
    
    return result;
  })
};

export const addPageHistory = (
  pageId: string,
  pageConfig: IPageConfig,
  avatar: string
) => {
  return request.post(`/page/${pageId}/history`, {
    content: pageConfig,
    avatar,
  });
};

export const deletePage = (pageId: string) => {
  return request.delete(`/page/${pageId}`);
};

export const publishPage = (pageId: string, avatar?: string) => {
  return request.post(`/page/${pageId}/publish`, { avatar });
};

export const setToHomePage = (pageId: string, appId: string) => {
  return request.post(`/app/${appId}/homePage`, { pageId });
};
