import React from "react";

import {
  AUTH_TOKEN,
  CURRENT_TEAM_STORAGE_KEY,
  CURRENT_APP_STORAGE_KEY,
} from "@/utils/constants";
import {
  addPageHistory,
  getPageByAppId,
  getUserInfo,
  login,
  sendCode,
  verifyCode,
} from "apis";
import {
  getApplicationsByTeamId,
  getApplication,
  deleteApplication,
} from "apis/app";
import { getTeam } from "apis/team";
import { FC, createContext, useContext } from "react";
import { IUser, IRegistryInfo } from "types/entities/User";

import { enableStaticRendering } from "mobx-react-lite";
import { setAuthorization } from "@/utils/request";
import { IApplication } from "types/entities/Application";
import { IPage, IPageHistory } from "types/entities/Page";
import { IPageConfig } from "@mtbird/shared/dist/types";
import Cookies from "js-cookie";
import ITeam from "types/entities/Team";
import { makeAutoObservable } from "mobx";
import { getPageDetails, weixinAuthorize, workWeixinAuthorize, mpAuthorize } from "apis";
import { getWxBetaFastApp } from "apis/wx";
import Storage from "utils/Storage";
import { IMiniProgramDto } from "./../types/entities/Wx";
import keys from "lodash/keys";
import { getToken, uploadImage } from "../apis/upload";
import { GlobalStorage } from "@mtbird/core";
import { message } from "antd";
import { AUTH_URLS } from "../utils/constants";
import { bindPhone } from "apis/user";
import SentryClient from "@/utils/sentry";
import { getAppsAuthUrl } from "../utils";
import { getActivationStatus } from "@/apis/installer";

// there is no window object on the server
enableStaticRendering(typeof window === "undefined");

class Store {
  constructor() {
    makeAutoObservable(this);
  }

  userInfo: IUser | null = null;
  token: string | null = null;
  currentTeamId: string | undefined = undefined;
  applications: IApplication[] = [];
  currentAppId: string | null = null;
  pages: IPage[] = [];
  currentPageId: string | null = null;
  currentPage: IPage | null = null;
  currentPageVersion: IPageHistory | null = null;
  teams: ITeam[] = [];
  modals: Record<string, any> = {};
  mp: IMiniProgramDto | null = null; // wechat mini program
  loadingMp: boolean = false; // is mp loading
  tourState: boolean = GlobalStorage.saasTourState;

  loginConfig: any = null;

  setLoginConfig  = (loginConfig: any) => {
    this.loginConfig = loginConfig;
  }

  get currentApp() {
    if (!this.currentAppId) return null;
    return (
      this.applications &&
      this.applications.find((cur) => {
        return cur.id === this.currentAppId;
      })
    );
  }

  get currentTeam() {
    if (!this.currentTeamId) return null;
    return (
      this.teams &&
      this.teams.find((cur) => {
        return cur.id === this.currentTeamId;
      })
    );
  }

  public activationStatus = false;
  getActivationStatus = () => {
    getActivationStatus().then(res => {
      if (res.code === 200) {
        this.activationStatus = !!res?.data?.isActivation
      }
    })
  }



  toggleTourState = () => {
    const val = !this.tourState;
    this.tourState = val;
    GlobalStorage.saasTourState = val;
  };

  setUserWxInfo = (wxInfo: any) => {
    if (this.userInfo?.wxInfo)  {
      this.userInfo.wxInfo = wxInfo;
    }
  };

  toUpload = async (files: any[]): Promise<string[]> => {
    if (!files || files.length < 1) return [];

    const tokenResp = await getToken();
    const res: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (!files[i]) continue;
      res.push(
        await uploadImage(
          files[i]?.originFileObj || files[i],
          tokenResp.data.token?.token as any
        )
      );
    }

    return res;
  };

  getHomePage = () => {
    const homePageId = this?.currentApp?.homePageId;
    if (!homePageId) return null;
    return this.pages.find((cur) => cur.id === homePageId);
  };

  getCurrentApp = () => {
    if (!this.currentAppId) return null;
    return (
      this.applications &&
      this.applications.find((cur) => {
        return cur.id === this.currentAppId;
      })
    );
  };

  saveToken = (token: string | null) => {
    localStorage.setItem(AUTH_TOKEN, token as string);
  }

  login = async (
    username: string,
    password: string,
    to: string,
    appId?: string,
  ) => {
    try {
      const data = await login(username, password, to, appId!,);
      if (data.code !== 200) {
        throw new Error(data.msg);
      }
      this.setupUserInfo(data.data);
      this.token = data.data.token;
      this.saveToken(this.token);
      setAuthorization(this.token as string);
      return this.token;
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  sendCode = async (phone: string) => {
    return sendCode(phone);
  };

  verify = async (phone: string, code: string, to: string, appId?: string, registryInfo?: IRegistryInfo) => {
    try {
      const data = await verifyCode(phone, code, to, appId!, registryInfo);
      if (data.code !== 200) {
        throw new Error(data.msg);
      }
      this.setupUserInfo(data.data);
      this.token = data.data.token;
      this.saveToken(this.token);
      setAuthorization(this.token as string);
      return this.token;
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  weixinAuthorize = async (code: string, to: string, appId: string, state: string, registryInfo?: IRegistryInfo) => {
    const result = await weixinAuthorize(
      code,
      to,
      appId,
      state,
      registryInfo
    );

    if (result.code !== 200) {
      throw new Error(result.msg);
    }
    this.token = result.data.token;
    setAuthorization(this.token as string);
    this.setupUserInfo(result.data);
   
    this.saveToken(this.token);
    

    return result.data;
  }

  miniProgramAuthorize = async (code: string, to: string, appId: string, registryInfo?: IRegistryInfo) => {
    const result = await mpAuthorize(
      code,
      to,
      appId,
      registryInfo
    );
      console.log(result)
    if (result.code !== 200) {
      throw new Error(result.msg);
    }
    this.token = result.data.token;
    setAuthorization(this.token as string);
    this.setupUserInfo(result.data);
   
    this.saveToken(this.token);
    

    return result.data;
  }

  workWeixinAuthorize =  async (code: string, to: string, appId: string, state: string, registryInfo?: IRegistryInfo) => {
    const result = await workWeixinAuthorize(
      code,
      to,
      appId,
      state,
      registryInfo
    );

    if (result.code !== 200) {
      throw new Error(result.msg);
    }
    this.token = result.data.token;
    setAuthorization(this.token as string);
    this.setupUserInfo(result.data);
   
    this.saveToken(this.token);

    return result.data;
  }


  bindPhone = async (phone: string, code: string) => {
    try {
      const data = await bindPhone(phone, code);
      if (data.code !== 200) {
        throw new Error(data.msg);
      }
     
    } catch (e: any) {
      throw new Error(e.msg);
    }
  };

  getUserInfo = async (fouce: boolean = false) => {
    if (this.userInfo && !fouce) return;
    const res = await getUserInfo();
    if (!res) return;
    this.teams = res.data.teams;
    await this.setupUserInfo(res.data);
  };

  private setupUserInfo = async (userInfo: IUser) => {
    this.userInfo = userInfo;
    SentryClient.login(userInfo);
    const storagedTeamId = Storage.getItem(CURRENT_TEAM_STORAGE_KEY);
    let currentTeamId = userInfo.teams[0]?.id || null;

    if (
      storagedTeamId &&
      userInfo.teams.find((cur) => cur.id === storagedTeamId)
    ) {
      currentTeamId = storagedTeamId;
    }
    if (!currentTeamId) return;

    if (location.pathname === "/auth/login") return;
    await this.setCurrentTeam(currentTeamId);
  };

  setCurrentTeam = async (teamId: string | undefined) => {
    this.currentTeamId = teamId;
    if (!teamId) return Storage.removeItem(CURRENT_TEAM_STORAGE_KEY);

    Storage.setItem(CURRENT_TEAM_STORAGE_KEY, teamId as string);
    await this.getApplications(teamId);
  };

  setCurrentApp = (appId: string | null) => {
    this.currentAppId = appId;
    if (!appId) return Storage.removeItem(CURRENT_APP_STORAGE_KEY);

    Storage.setItem(CURRENT_APP_STORAGE_KEY, appId as string);
    this.getPages(appId);
  };

  setCurrentPage = (pageId: string | null) => {
    if (!pageId) {
      this.currentPageId = null;
      this.currentPage = null;
    } else {
      return this.initCurrentPage(pageId);
    }
  };

  getApplications = async (teamId: string | null) => {
    if (!teamId) this.applications = [];
    let res = null;
    let storagedAppId: string | null | undefined = '';

    try {

      res = await getApplicationsByTeamId(teamId as string);
      this.applications = res.data;
      storagedAppId = Storage.getItem(CURRENT_APP_STORAGE_KEY);
    } catch (error) {
      
    }

    if (res?.data?.length > 0) {
      const storagedApp = res?.data.find((cur: any) => cur.id === storagedAppId)?.id;

      if (!storagedApp && storagedAppId)
        Storage.removeItem(CURRENT_APP_STORAGE_KEY);
      this.setCurrentApp(storagedApp || res?.data?.[0]?.id);
    } else {
      this.currentAppId = null;
      this.pages = [];
      this.currentPage = null;
      this.currentPageId = null;
    }
  };

  refreshCurrentTeam = async () => {
    const res = await getTeam(this.currentTeamId!);
    this.teams = this.teams.map((cur) => {
      if (cur.id === this.currentTeamId) return res.data;
      return cur;
    });
  };

  refreshCurrentApp = async () => {
    const res = await getApplication(this.currentAppId!);
    this.applications = this.applications.map((cur) => {
      if (cur.id === this.currentAppId) return res.data;
      return cur;
    });
  };

  getPages = async (appId: string | null) => {
    if (!appId) this.applications = [];
    const res = await getPageByAppId(appId as string);
    this.pages = res.data;
  };

  initCurrentPage = async (pageId: string) => {
    const res = await getPageDetails(pageId);
    this.currentPageId = pageId;
    this.currentPage = res.data.page as IPage;
    this.currentPageVersion = res.data.history as IPageHistory;
    return res.data.page;
  };

  logout = () => {
    localStorage.clear();
    SentryClient.logout();
    location.href = "/auth/logout";
  };

  registerModal = (name: string) => {
    this.modals[name] = false;
  };

  initModals = (modal: Record<string, any>) => {
    keys(modal).forEach((key) => {
      this.modals[key] = false;
    });
  };

  openModal = (name: string, params?: any) => {
    this.modals[name] = params || true;
  };

  hideModal = (name: string) => {
    if (this.modals[name]?.afterClose) {
      this.modals[name].afterClose();
    }
    this.modals[name] = false;
  };

  visible = (name: string) => {
    return this.modals[name];
  };

  saveNewVersion = async (pageConfig: IPageConfig, avatar: string) => {
    const res = await addPageHistory(
      this.currentPageId as string,
      pageConfig,
      avatar
    );
    this.currentPageVersion = res.data;
  };

  deleteApp = async (appId: string) => {
    await deleteApplication(appId);
    this.getApplications(this.currentTeamId as string);
  };

  initWxMp = async () => {
    this.loadingMp = true;
    try {
      const wxMpRes = await getWxBetaFastApp(this.currentAppId!);
      this.mp = wxMpRes.data;
    } catch (e) {
      this.mp = null;
    } finally {
      this.loadingMp = false;
    }
  };

  afterLogin = (to: string, redirectUrl: string, res: any) => {
    message.success("登录成功!");
    Cookies.set('t', res, {
      expires: 7,
      path: '/'
    });

    to = decodeURIComponent(to);

    if (!to || to === "mtbird") {
      location.href = redirectUrl ? decodeURIComponent(redirectUrl) : "/";
      return;
    }

    const append =
      redirectUrl &&
      (redirectUrl.startsWith("http://") ||
        redirectUrl?.startsWith("https://"));

    const authUrl = to.startsWith("apps/") ? getAppsAuthUrl(to) : AUTH_URLS[to];

    console.log("ttt to:", to, authUrl, AUTH_URLS);

    let targetUrl = this.loginConfig?.loginCallbackUrl || authUrl || redirectUrl;
    if (targetUrl?.indexOf('?') === -1) {
      targetUrl += '?'
    }
    
    const restQuery = this.getRestQuery();

    location.href =
      `${targetUrl}&t=${res}` +
      (append ? `&redirectUrl=${encodeURIComponent(redirectUrl)}` : "") + 
      (restQuery ? `&${restQuery}` : '');
  };

  private getRestQuery = () => {
    const search = new URLSearchParams(location.search);
    search.delete("redirectUrl");
    search.delete("to");

    return search.toString();
  }
}

const StoreContext = createContext<Store>(new Store());

const StoreProvider: FC<{ store: Store; children: any }> = ({
  store,
  children,
}: any) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

const useStore = () => {
  return useContext(StoreContext);
};

function withStore(Component: any) {
  return function WrappedComponent(props: any) {
    const rootStore = useStore();

    return <Component {...props} rootStore={rootStore} />;
  };
}

export { Store, StoreProvider, useStore, withStore };
