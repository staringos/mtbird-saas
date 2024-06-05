import { IBox } from "types/entities/Team";

export const AUTH_URLS: Record<string, string | undefined> = {
  staringai: process.env.NEXT_PUBLIC_STARINGAI,
  staringchat: process.env.NEXT_PUBLIC_STARINGCHAT,
  staringmetahuman: process.env.NEXT_PUBLIC_STARINGMETAHUMAN,
  "staringai-videos": process.env.NEXT_PUBLIC_STARINGAI_VIDEOS,
  "staringai-open": process.env.NEXT_PUBLIC_STARINGAI_OPEN,
  "staringai-featured": process.env.NEXT_PUBLIC_STARINGAI_FEATURED,
  pzx: process.env.NEXT_PUBLIC_XC_KIDS,
};

export const isDevelopment = process.env.NODE_ENV === "development";

export enum BRAND_NAME {
  STARINGAI_XIAOXING = "staringai",
  STARINGAI_CHAT = "staringchat",
  STARINGAI_METAHUMAN = "staringmetahuman",
  STARINGAI_OPEN = "staringai-open",
  STARINGAI_FEATURED = "staringai-featured",
  STARINGAI_VIDEOS = "staringai-videos",
}

type Brand = {
  logo: string;
  slogan: string;
};

type StaringAIBrandType = {
  [key in BRAND_NAME]: Brand;
} & {
  Default: Brand;
};

export const STARINGAI_BRAND: StaringAIBrandType = {
  [BRAND_NAME.STARINGAI_VIDEOS]: {
    logo: "/statics/xiaoxing.png",
    slogan: "一键生成高清视频故事",
  },
  [BRAND_NAME.STARINGAI_FEATURED]: {
    logo: "/statics/xiaoxing.png",
    slogan: "专业的AIGC内容精选",
  },
  [BRAND_NAME.STARINGAI_XIAOXING]: {
    logo: "/statics/xiaoxing.png",
    slogan: "好用的AI内容创意工具",
  },
  [BRAND_NAME.STARINGAI_CHAT]: {
    logo: "/statics/staringai-chat-platform.png",
    slogan: "",
  },
  [BRAND_NAME.STARINGAI_OPEN]: {
    logo: "/statics/staringai-open-platform.png",
    slogan: "",
  },
  [BRAND_NAME.STARINGAI_METAHUMAN]: {
    logo: "/statics/xiaoxing.png",
    slogan: "创建你的AI数字形象",
  },
  Default: {
    logo: "/statics/logo.png",
    slogan: "你心所想，既是应用",
  },
};

export const PlatformTranslate = {
  h5: "H5",
  pc: "网站",
  miniProgram: "小程序",
  app: "App",
  all: "跨平台",
};

export const ORDER_STATUS = {
  created: "已创建",
  confirming: "确认中",
  paid: "已支付",
  expired: "已过期",
  closed: "已关闭",
};

export const TEAM_VERSIONS_DICT: Record<string, string> = {
  normal: "普通版",
  professional: "专业版",
  enterprise: "企业版",
  private: "内部部署版",
};

export const WX_VERIFY_MP_CALLBACK_ERROR = {
  89251: "模板消息已下发，待法人人脸核身校验",
  100001: "已下发的模板消息法人并未确认且已超时（24h），未进行身份证校验",
  100002: "已下发的模板消息法人并未确认且已超时（24h），未进行人脸识别校验",
  100003: "已下发的模板消息法人并未确认且已超时（24h）",
  100004: "实名认证的信息和法人姓名不一致",
  101: "法人扫脸后，工商数据返回：“企业已注销”",
  102: "法人扫脸后，工商数据返回：“企业不存在或企业信息未更新”",
  103: "法人扫脸后，工商数据返回：“企业法定代表人姓名不一致”",
  104: "法人扫脸后，工商数据返回：“企业法定代表人身份证号码不一致”",
  105: "法人扫脸后，法定代表人身份证号码，工商数据未更新，请 5-15 个工作日之后尝试",
  1000: "法人扫脸后，工商数据返回：“企业信息或法定代表人信息不一致”",
  89252: "模板消息已下发，待小程序管理员确认",
} as Record<string, string>;

export const PAGE_TYPE_SELECT = [
  {
    label: "PC网页/官网",
    key: "pc",
    children: "",
  },
  {
    label: "手机网页/H5/微信",
    key: "mobile",
    children: "",
  },
  {
    label: "表单/报名/投票",
    key: "form",
    children: "",
  },
];

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

export const CURRENT_TEAM_STORAGE_KEY = "TSK";
export const CURRENT_APP_STORAGE_KEY = "ASK";
export const AUTH_TOKEN = "AUTH_TOKEN";
export const APP_TYPES = ["h5网站", "桌面网站", "小程序", "App"];
export const PAGE_TYPES = ["h5", "PC"];

export const CURRENT_APP_DETAIL_INFO_KEY = "CURRENT_APP";

export const PAGE_DATA_EMPTY = {
  id: "123333",
  type: "container",
  componentName: "ContainerRoot",
  layout: "flex",
  parent: "123",
  props: {
    style: {
      fontSize: 12,
      position: "relative",
      width: "100%",
      height: "100%",
      zIndex: 0,
    },
  },
  children: [
    {
      id: "443454",
      type: "container",
      parent: "123333",
      componentName: "ContainerBlock",
      props: {
        style: {
          height: 400,
        },
      },
      children: [],
    },
  ],
};
export const GLOBAL_DEFAULT_TITLE =
  process.env.PUBLIC_SYSTEM_NAME || "星搭精卫 - 极速落地页搭建，业务组件灵活接入，自定义插件动态拓展";
export const GLOBAL_DEFAULT_DESC =
  process.env.PUBLIC_SYSTEM_DESC ||  "星搭低代码平台专注企业官网、H5、落地页在线设计、搭建,平台提供63类场景图片设计模板，一键生成，在线编辑。公众号页面、投票、统计、投放落地页。极速落地页搭建，业务组件灵活接入，自定义插件动态拓展";
export const GLOBAL_DEFAULT_KEYWORD =
  "星搭、低代码、官网、H5、投票、统计、表单、数据分析、无代码、搭建、中后台、应用";

export const DEFAULT_PAGE_TITLE = "新建页面";

export const DEFAULT_TEMPLATE = {
  name: "空白页面",
  content: PAGE_DATA_EMPTY,
  avatar: "https://mtbird-cdn.staringos.com/empty1.png",
};

export const OPTIONS = [
  { label: "市场", value: "market" },
  { label: "团队", value: "team" },
  { label: "我的", value: "my" },
];

export const PAY_PERIOD_OPTIONS = [
  { label: "月付", value: "monthly" },
  { label: "年付 💰优惠两个月", value: "yearly" },
];

export const LIST_TEMPLATE = [
  { title: "团队成员", desc: "2人", unit: "人", key: "memberNum" },
  { title: "应用数量", desc: "1个", unit: "个", key: "appNum" },
  { title: "页面数量", desc: "5个", unit: "个", key: "pageNum" },
  { title: "生成小程序", desc: "1个", unit: "个", key: "templateNum" },
  { title: "公共模版", desc: "✅", key: "enablePublicTemplate" },
  { title: "公共拓展", desc: "✅", key: "enablePublicExtension" },
  { title: "绑定域名", desc: "✅", key: "enableBindDomainName" },
  { title: "私有模版", desc: "❌", key: "enablePrivateTemplate" },
  { title: "私有拓展", desc: "❌", key: "enablePrivateExtension" },
  { title: "接入自有API", desc: "❌", key: "enableAPI" },
  { title: "7*24h专属技术支持", desc: "❌", key: "enable724CustomerService" },
  { title: "私有化数据存储", desc: "❌", key: "enablePrivateDataStorage" },
];

export const PackageList = [
  {
    name: "网站搭建",
    desc: "从域名备案到网站设计、搭建，完整网站搭建服务",
    version: "normal",
    unitPrice: 5899,
    period: "月",
    discount: "",
    buttonTitle: "获取方案",
    buttonType: "primary",
    buttonDisabled: false,
    showPrice: true,
    isStart: true,
    list: [
      { title: "网站需求梳理", desc: "✅" },
      { title: "普通域名申请", desc: "✅" },
      { title: "域名备案服务", desc: "✅" },
      { title: "全站设计", desc: "✅" },
      { title: "网站搭建", desc: "✅" },
      { title: "新闻/博客", desc: "✅" },
      { title: "产品介绍", desc: "✅" },
      { title: "联系方式", desc: "✅" },
      { title: "移动端响应式", desc: "✅" },
      { title: "客户转化", desc: "✅" },
      { title: "基础SEO优化", desc: "✅" },
      { title: "团队服务（设计、产品、技术）", desc: "✅" },
      { title: "7*24h技术支持", desc: "✅" },
    ],
  },
  {
    version: "professional",
    name: "小程序搭建",
    desc: "企业展示、产品展示、活动、电商，各类型小程序从设计到搭建",
    unitPrice: 8699,
    period: "月",
    discount: "",
    buttonTitle: "获取方案",
    buttonType: "primary",
    buttonDisabled: false,
    showPrice: true,
    isStart: true,
    list: [
      { title: "小程序需求梳理", desc: "✅" },
      { title: "小程序申请审核", desc: "✅" },
      { title: "小程序UI设计", desc: "✅" },
      { title: "小程序搭建", desc: "✅" },
      { title: "小程序登录", desc: "✅" },
      { title: "新闻/博客", desc: "✅" },
      { title: "产品介绍", desc: "✅" },
      { title: "联系方式", desc: "✅" },
      { title: "移动端响应式", desc: "✅" },
      { title: "客户转化", desc: "✅" },
      { title: "基础微信SEO优化", desc: "✅" },
      { title: "团队服务（设计、产品、技术）", desc: "✅" },
      { title: "7*24h技术支持", desc: "✅" },
    ],
  },
  {
    version: "enterprise",
    name: "后台系统搭建",
    desc: "CMS、ERP、OA等后台系统业务流程设计搭建",
    unitPrice: 8699,
    period: "月",
    discount: "",
    buttonTitle: "获取方案",
    buttonType: "primary",
    buttonDisabled: false,
    showPrice: true,
    isStart: true,
    list: [
      { title: "系统需求梳理", desc: "✅" },
      { title: "现有接口对接", desc: "✅" },
      { title: "系统交互UI设计", desc: "✅" },
      { title: "数据结构设计", desc: "✅" },
      { title: "后台系统搭建", desc: "✅" },
      { title: "图标报表", desc: "✅" },
      { title: "增删改查", desc: "✅" },
      { title: "仪表盘", desc: "✅" },
      { title: "移动端响应式", desc: "✅" },
      { title: "对外接口", desc: "✅" },
      { title: "账户体系及SSO", desc: "✅" },
      { title: "团队服务（设计、产品、技术）", desc: "✅" },
      { title: "7*24h技术支持", desc: "✅" },
    ],
  },
  {
    version: "enterprise",
    name: "营销推广",
    desc: "营销投放顾问，帮助企业制定线上投放策略，执行跨平台投放",
    unitPrice: 899,
    period: "月",
    discount: "",
    buttonTitle: "获取方案",
    buttonType: "primary",
    buttonDisabled: false,
    showPrice: false,
    isStart: true,
    list: [
      { title: "投放方案", desc: "✅" },
      { title: "投放创意设计", desc: "✅" },
      { title: "全平台投放账户开通", desc: "✅" },
      { title: "广告计划搭建", desc: "✅" },
      { title: "人群数据收集", desc: "✅" },
      { title: "投放成本优化", desc: "✅" },
      { title: "专业SEO优化", desc: "✅" },
      { title: "投放线索CRM", desc: "✅" },
      { title: "投放数据对接", desc: "✅" },
      { title: "客户转化", desc: "✅" },
      { title: "基础微信SEO优化", desc: "✅" },
      { title: "团队服务（设计、产品、技术）", desc: "✅" },
      { title: "7*24h技术支持", desc: "✅" },
    ],
  },
];

export const TEAM_VERSION: any[] = [
  {
    version: "normal",
    price: 0,
    period: "月",
    discount: "",
    buttonTitle: "",
    buttonType: "default",
    buttonDisabled: false,
    showPrice: true,
  },
  {
    version: "professional",
    price: 289,
    period: "月",
    discount: "",
    buttonTitle: "立即升级",
    buttonType: "primary",
    buttonDisabled: false,
    showPrice: true,
  },
  {
    version: "enterprise",
    title: "企业版",
    desc: "适合大团队和企业",
    price: 899,
    period: "月",
    discount: "",
    buttonTitle: "立即升级",
    buttonType: "primary",
    buttonDisabled: false,
    showPrice: true,
  },
  {
    version: "private",
    title: "内部部署版",
    desc: "适合有内网部署需求的企业",
    price: 0,
    period: "月",
    discount: "",
    buttonTitle: "获取报价",
    buttonType: "default",
    buttonDisabled: false,
    showPrice: false,
  },
];

export const TEAM_VERSION_YEARLY: IBox[] = [
  {
    ...TEAM_VERSION[0],
    price: TEAM_VERSION[0].price * 10,
    period: "年",
  },
  {
    ...TEAM_VERSION[1],
    list: TEAM_VERSION[1].list,
    price: TEAM_VERSION[1].price * 10,
    period: "年",
    discount: "优惠两个月",
    buttonTitle: "立即升级",
    buttonType: "primary",
    buttonDisabled: false,
  },
  {
    ...TEAM_VERSION[2],
    list: TEAM_VERSION[2].list,
    price: TEAM_VERSION[2].price * 10,
    discount: "优惠两个月",
    period: "年",
  },
  {
    ...TEAM_VERSION[3],
    list: TEAM_VERSION[3].list,
    price: TEAM_VERSION[3].price * 10,
    period: "年",
  },
];

export const ORDER_FROM: Record<string, string> = {
  open: "星搭云AI开放平台",
  mtbird: "星搭云AI低代码平台",
  chat: "星搭云AI智慧客服",
  staringai: "星搭小星",
  featured: "星搭精选",
  pzx: "派照星",
};

export const PZX_TITLE = "派照星 - AI儿童摄影，宝贝照、满月照、亲子照专家";
