import { message } from "antd";
import { isWeixin } from "../utils";
import request from "../utils/request";
import { IPage } from "@/types/entities/Page";

const appId = process.env.NEXT_PUBLIC_WX_APP_ID;

export const initWx = async (page: IPage) => {
  const wx = require("weixin-js-sdk");
  const res = await request.get("/wx/getSign", {
    params: {
      url: location.href.split("#")[0],
    },
  });

  const wxParams = {
    debug: false, // 开启调试模式
    appId, // 必填，公众号的唯一标识
    timestamp: res.data.timestamp, // 必填，生成签名的时间戳
    nonceStr: res.data.noncestr, // 必填，生成签名的随机串
    signature: res.data.signature, // 必填，签名，见附录1
    jsApiList: [
      "chooseImage",
      "previewImage",
      "uploadImage",
      "downloadImage",
      "updateAppMessageShareData",
      "updateTimelineShareData",
      "onMenuShareTimeline",
      "onMenuShareAppMessage",
    ], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  };

  console.log("rrrrrr234 res:", res, wxParams);

  wx.config(wxParams);

  wx.error(function (res: any) {
    console.log("[error] res:", res);
  });

  wx.ready(function () {
    // auto play video
    console.log("WeixinJSBridgeReady ready");

    document.addEventListener("click", function () {
      console.log("WeixinJSBridgeReady click");
      const videos = document.getElementsByTagName("video");
      // if video tag is autoplay, then play it
      const videoArray = (Array.from(videos) || []).filter(
        (video) => video.autoplay
      );
      videoArray.forEach((video) => {
        try {
          video.play();
        } catch (e) {}
      });
    });

    const videos = document.getElementsByTagName("video");
    // if video tag is autoplay, then play it
    const videoArray = (Array.from(videos) || []).filter((video) => {
      console.log("video.autoplay:", video.autoplay, video.dataset);
      return video.autoplay || video.getAttribute("data-autoplay");
    });

    console.log("videoArray 123335:", videoArray);

    videoArray.forEach((video) => {
      try {
        video.play();
      } catch (e) {
        console.log("eeeeeee:", e);
        // message.error(e.message);
      }
      // if (navigator.userAgent.indexOf("Android") > 0 && isWeixin()) {
      // }
    });

    //需在用户可能点击分享按钮前就先调用
    wx.onMenuShareAppMessage({
      title: page.title, // 分享标题
      link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
      imgUrl: page.avatarShare || page.avatar, // 分享图标
      desc: page.desc,
      success: function () {},
    });

    wx.onMenuShareTimeline({
      title: page.title, // 分享标题
      link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
      imgUrl: page.avatarShare || page.avatar, // 分享图标
      success: function () {},
    });
  });
};

export const registerBetaMP = async (appId: string) => {
  return request.post(`/wx/open/beta/register`, { appId });
};

export const getUserWechatInfo = async (state: string) => {
  return request.get(`/wx/login/state`, { params: { state } });
};

export const getWxBetaFastApp = async (appId: string) => {
  return request.get(`/wx/open/${appId}`);
};

export const getAT = async (appId: string) => {
  return request.get(`/wx/open/${appId}/ak`);
};

export const processCheck = async (appId: string) => {
  return request.get(`/wx/open/${appId}/check`);
};

export const commitCode = async (appId: string) => {
  return request.post(`/wx/open/${appId}/commit`, { appId });
};

export const verifyBetaMp = async (companyId: string, appId: string) => {
  return request.post(`/wx/open/${appId}/verify`, { companyId });
};

export const setMPName = async (appId: string, name: string) => {
  return request.post(`/wx/open/${appId}/setName`, { name });
};

export const addCategories = async (
  appId: string,
  categories: Record<string, any>[]
) => {
  return request.post(`/wx/open/${appId}/categories`, { categories });
};

export const getAllCategories = async (appId: string) => {
  return request.get(`/wx/open/${appId}/allCategories`);
};

export const submitAudit = async (
  appId: string,
  versionDesc: string,
  feedbackInfo: string
) => {
  return request.post(`/wx/open/${appId}/audit`, { versionDesc, feedbackInfo });
};

export const submitAppDetails = async (appId: string) => {
  return request.post(`/wx/open/${appId}/detailsSync`);
};

export const refreshMpAuditStatus = async (appId: string) => {
  return request.post(`/wx/open/${appId}/auditStatusSync`);
};

export const refreshOfficalQrcode = async (appId: string) => {
  return request.post(`/wx/open/${appId}/refreshOfficalQrcode`);
};

export const setDomain = async (appId: string) => {
  return request.post(`/wx/open/${appId}/setDomain`);
};

export const setApiDomain = async (appId: string) => {
  return request.post(`/wx/open/${appId}/setApiDomain`);
};


export const getGZHQrcode = async (scene: { registryInfo?: any, to?: string }) => {
  return request.post(`/wx/qrcode`, {
    scene
  })
}

export const checkLogin = async (sceneId: string) => {
  return request.get(`/auth/weixin/checkLogin?sceneId=${sceneId}`)
}