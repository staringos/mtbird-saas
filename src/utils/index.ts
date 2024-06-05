import { ISearch } from "@mtbird/shared/dist/types";
import { MenuProps } from "antd";
import {
  GLOBAL_DEFAULT_TITLE,
  TEAM_VERSION,
  TEAM_VERSION_YEARLY,
} from "./constants";
import { LIST_TEMPLATE } from "./constants";
import { IGoodDTO } from "@/types/entities/Order";
import { IRegistryInfo } from "@/types/entities/User";

type MenuItem = Required<MenuProps>["items"][number];

export const getTeamVersionList = (goods: IGoodDTO[], period: string) => {
  return goods.map((cur: Record<string, any>, i: number) => {
    const list = LIST_TEMPLATE.map((item) => {
      let desc = item.unit
        ? `${cur[item.key]}${item.unit}`
        : `${cur[item.key] ? "✅" : "❌"}`;

      if (cur[item.key] === -1) desc = "不限";
      if (cur[item.key] === -2) desc = "按需购买";

      return {
        title: item.title,
        desc,
      };
    });

    const unitPrice = period === "monthly" ? cur.unitPrice : cur.unitPrice * 10;
    const versionDetails =
      period === "monthly" ? TEAM_VERSION[i] : TEAM_VERSION_YEARLY[i];

    return { ...versionDetails, ...cur, unitPrice, list };
  });
};

export const generateSearch = (search: ISearch[]) => {
  const where = {} as Record<string, any>;
  const data = [] as Record<string, any>[];
  search.forEach((cur: ISearch) => {
    if (cur.keyPath.startsWith("data.")) {
      const path = cur.keyPath.replace("data.", "");
      const operator = cur.operator;
      data.push({
        path,
        [operator]: cur.value,
      });
    } else {
      where[cur.keyPath] = cur.value;
    }
  });

  if (data.length > 0) where.data = data;
  return where;
};

export const generateWxExtJson = (appId: string, wxAppId: string) => {
  return {
    extEnable: true,
    extAppid: wxAppId,
    directCommit: false,
    ext: {
      mtbirdAppId: appId,
      appId: wxAppId,
      name: "wechat",
      attr: {
        host: "https://mtbird.staringos.com/api",
        pageHost: "https://mtbird.staringos.com",
      },
    },
  };
};

export const dateFormatter = (date: string) => {
  if (!date) return "";
  const localDate = new Date(date);

  let day = localDate.getDate();
  let month = localDate.getMonth();
  let year = localDate.getFullYear();

  return `${year}-${
    month + 1
  }-${day} ${localDate.getHours()}:${localDate.getMinutes()}`;
};

export const phoneMask = (phone?: string) => {
  if (!phone) return '';
  return phone.substring(0, 3) + " **** " + phone.substring(7);
};

export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

export const isStringEmpty = (str: string) => {
  return !str || str.length <= 0;
};

export const setGlobalTitle = (title: string) => {
  if (isStringEmpty(title)) {
    document.title = GLOBAL_DEFAULT_TITLE;
  } else {
    document.title = title + " - " + GLOBAL_DEFAULT_TITLE;
  }
};

export const verifyPhoneNumber = (phone: string) => {
  if (isStringEmpty(phone)) return false;
  if (/^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/.test(phone))
    return true;
  return false;
};

export const dataURItoBlob = (dataURI: string) => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString });
  return blob;
};

export const urlencode = (str: string) => {
  str = (str + "").toString();
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/%20/g, "+");
};

//解析微信xml
export const parseWechatXML = (xml: string) => {
  if (!xml || typeof xml != "string") return {};
  var re = {} as any;
  xml = xml.replace(/^<xml>|<\/xml>$/g, "");
  var ms = xml.match(/<([a-z0-9]+)>([\s\S]*?)<\/\1>/gi);
  if (ms && ms.length > 0) {
    ms.forEach((t) => {
      let ms: any = t.match(/<([a-z0-9]+)>([\s\S]*?)<\/\1>/i);
      let tagName = ms[1];
      let cdata = ms[2] || "";
      cdata = cdata.replace(/^\s*<\!\[CDATA\[\s*|\s*\]\]>\s*$/g, "");
      re[tagName] = cdata;
    });
  }
  return re;
};

export function isWeixin() {
  if (typeof window === 'undefined') return false;
  var ua = navigator.userAgent.toLowerCase() as any;
  if (ua.match(/MicroMessenger/i) === "micromessenger") {
    return true;
  } else {
    return false;
  }
}

// export const getBrowserEnv = () => {
//   return new Promise(resolve => {
//     const ua = window.navigator.userAgent.toLowerCase()
//     if ((ua as RegExpMatchArray).match(/MicroMessenger/i) === 'micromessenger') {
//       //微信环境下
//       wx.miniProgram.getEnv((res: any) => {
//         if (res.miniprogram) {
//           // 小程序环境下逻辑
//           resolve('miniProgram')
//         } else {
//           //非小程序环境下逻辑
//           resolve('wxWeb')
//         }
//       })
//     } else {
//       resolve('others')
//     }
//   })
// }

export const randomString = (length = 8) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

export const getRegistryInfoFromQuery = (
  query: Record<string, string>
): Partial<IRegistryInfo> | undefined => {
  const info = ["redirectUrl", "userFrom", "userIntroducer", "f"].reduce(
    (info, key) => {
      if (query?.[key]) {
        info[key] = query[key];
      }
      return info;
    },
    {} as Record<string, string | boolean>
  );

  info.nativeIos = nativeIos;

  if (!Object.keys(info).length) return;

  return info;
};

export const isMobile = () => {
  if (typeof window !== 'undefined') {
    const userAgent =
      window.navigator && window.navigator.userAgent;
    const mobileRegex = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/;
    return Boolean(userAgent.match(mobileRegex));
  }
}


export const u = typeof window !== 'undefined' ? window.navigator.userAgent : null;
export const nativeIos = u === 'uni-app' ? true : false;


export const debounce = (func: () => void, wait = 300) => {
  let timer: any;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, wait);
  };
};

export const getAppsAuthUrl = (toAppStr: string) => {
  const appPath = toAppStr.replace(/^apps\//, '');

  return `${process.env.NEXT_PUBLIC_APPS_HOST}/api/auth/${appPath}`
}