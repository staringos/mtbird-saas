// 媒体文件类型定义
export interface MediaFile {
  media_id: string;
}

// 地理位置类型定义
export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

// 链接类型定义
export interface Link {
  title: string;
  desc: string;
  url: string;
  pic_url: string;
}

// 名片类型定义
export interface BusinessCard {
  userid: string;
}

// 小程序类型定义
export interface MiniProgram {
  title: string;
  appid: string;
  pagepath: string;
  thumb_media_id: string;
}

// 菜单类型定义
export interface MenuItemClick {
  type: "click";
  click: {
    id: string;
    content: string;
  };
}

export interface MenuItemView {
  type: "view";
  view: {
    url: string;
    content: string;
  };
}

export interface MenuItemMiniProgram {
  type: "miniprogram";
  miniprogram: {
    appid: string;
    pagepath: string;
    content: string;
  };
}

export type MenuItem = MenuItemClick | MenuItemView | MenuItemMiniProgram;

// 菜单消息类型定义
export interface MenuMessage {
  head_content: string;
  list: MenuItem[];
  tail_content: string;
}

export enum MessageTypeEnum {
  Text = "text",
  Image = "image",
  Voice = "voice",
  Video = "video",
  File = "file",
  Location = "location",
  Link = "link",
  BusinessCard = "business_card",
  MiniProgram = "miniprogram",
  MsgMenu = "msgmenu",
  Event = "event",
}

type MessageType = {
  msgtype: MessageTypeEnum.Text;
  text: { content: string; menu_id?: string };
} & {
  msgtype: MessageTypeEnum.Image;
  image: MediaFile;
} & {
  msgtype: MessageTypeEnum.Voice;
  voice: MediaFile;
} & {
  msgtype: MessageTypeEnum.Video;
  video: MediaFile;
} & {
  msgtype: MessageTypeEnum.File;
  file: MediaFile;
} & {
  msgtype: MessageTypeEnum.Location;
  location: Location;
} & {
  msgtype: MessageTypeEnum.Link;
  link: Link;
} & {
  msgtype: MessageTypeEnum.BusinessCard;
  business_card: BusinessCard;
} & {
  msgtype: MessageTypeEnum.MiniProgram;
  miniprogram: MiniProgram;
} & {
  msgtype: MessageTypeEnum.MsgMenu;
  msgmenu: MenuMessage;
} & {
  msgtype: "event";
  event: {
    event_type: "enter_session";
    open_kfid: string;
    external_userid: string;
    scene: string;
    scene_param: string;
    welcome_code?: string;
    wechat_channels?: {
      nickname?: string;
      shop_nickname?: string;
      scene: 1 | 2 | 3 | 4 | 5;
    };
  };
};

export type SyncMsgItem = {
  msgid: string;
  open_kfid: string;
  external_userid: string;
  send_time: number;
  origin: 3 | 4 | 5;
  msgtype: MessageType["msgtype"];
} & MessageType;

export interface SyncMsgResponse {
  errcode: number;
  errmsg: string;
  next_cursor: string;
  has_more: 0 | 1;
  msg_list: SyncMsgItem[];
}

export type ChatBotInfo = {
  id: string;
  assistantId: string;
  createUserId: string;
  name: string;
  page: string;
  primaryColor: string;
  domainName: string;
  teamId: string;
  aiToken: string;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChatBotData = {
  id: string;
  kfId: string;
  chatBotId: string;
  Chatbot: ChatBotInfo;
};

/**
 * 企业微信 外部客户信息
 */
export type CustomerInfo = {
  external_userid: string; // 微信客户的 external_userid
  nickname: string; // 微信昵称
  avatar: string; // 微信头像。第三方不可获取
  gender: number; // 性别。第三方不可获取，统一返回0
  unionid: string; // unionid，需要绑定微信开发者帐号才能获取到，查看绑定方法。第三方不可获取
  enter_session_context?: {
    scene: string; // 进入会话的场景值，获取客服帐号链接开发者自定义的场景值
    scene_param: string; // 进入会话的自定义参数，获取客服帐号链接返回的url，开发者按规范拼接的scene_param参数
    wechat_channels?: {
      nickname: string; // 视频号名称，视频号场景值为1、2、3时返回此项
      shop_nickname: string; // 视频号小店名称，视频号场景值为4、5时返回此项
      scene: number; // 视频号场景值。1：视频号主页，2：视频号直播间商品列表页，3：视频号商品橱窗页，4：视频号小店商品详情页，5：视频号小店订单页
    };
  };
};

export type Servicer = {
  open_kfid: string;
  name: string;
  avatar: string;
}