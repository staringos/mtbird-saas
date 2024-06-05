import { WX_ERROR_PLEASE_CONTRACT } from "@/utils/messages";
import { isNumber } from "lodash";
import isArray from "lodash/isArray";
import { NextApiRequest, NextApiResponse } from "next";
import qiniu from "qiniu";
import { generateResponse } from "./response";
import { Readable } from "stream";
const xml2js = require("xml2js");

const filesystem = require("fs");
const https = require("https");

export const timeZone = (utcDate: string) => {
  const date = new Date(utcDate);
  // 当前时间 = 包含时差的当前时间 + 时差时间，getTimezoneOffset() 获取时差（以分钟为单位），转为小时需要除以 60
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  return date;
};

export const sendFastMPErrorMessage = (res: NextApiResponse, e: any) => {
  if (e.errcode === 86017) {
    return res
      .status(400)
      .send(
        generateResponse(
          400,
          "小程序名称不合规，请前往设置页面修改应用名称。具体可以参考：https://kf.qq.com/faq/170109umMvm6170109MZNnYV.html"
        )
      );
  }
  res
    .status(400)
    .send(generateResponse(400, WX_ERROR_PLEASE_CONTRACT + " " + e.errcode));
};

export const saveResponseBodyAsFile = (
  basePath: string,
  filePath: string,
  body: any
) => {
  if (!filesystem.existsSync(basePath)) {
    filesystem.mkdirSync(basePath);
  }

  filesystem.writeFileSync(filePath, body, "binary", function (err: any) {
    console.log("fs err:", err);
  });
  return true;
};

export const vaildPassword = (password: string) => {
  if (password.length < 8) return false;
  return true;
};

export const refreshCDN = (mac: any, address: string[]) => {
  const cdnManager = new qiniu.cdn.CdnManager(mac);
  cdnManager.refreshUrls(address, function (err: any, respBody: any, respInfo: any) {})
};

export const moveFile = (
  mac: any,
  bucket: string,
  srcKey: string,
  destKey: string
) => {
  const config = new qiniu.conf.Config();
  (config as any).zone = qiniu.zone.Zone_z0;
  const bucketManager = new qiniu.rs.BucketManager(mac, config);
  const options = {
    force: true,
  };

  bucketManager.copy(bucket, srcKey, bucket, destKey, options, function () {});
};

export const uploadFile = (
  relativePath: string,
  file: any,
  token: string,
  folder: string
) => {
  return new Promise((resolve, reject) => {
    const extra = new qiniu.form_up.PutExtra();
    const config: any = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    config.useCdnDomain = true;
    const key = relativePath + folder;

    formUploader.putFile(token, key, file, extra, (err, ret) => {
      if (err) {
        reject(err);
      } else {
        resolve(process.env.NEXT_PUBLIC_CDN_URL + "/" + ret.key);
      }
    });
  });
};

export const getFromQuery = (req: NextApiRequest, key: string) => {
  const value = req.query[key];
  return isArray(value) ? value[0] : value;
};

export const getFromBody = (
  req: NextApiRequest,
  key: string,
  isSingle: boolean = true
) => {
  const value = req.body[key];
  if (!isSingle) return value;
  return isArray(value) ? value[0] : value;
};

export const downloadImage = (
  url: string,
  dest: string,
  cb: (str?: string) => void
) => {
  const file = filesystem.createWriteStream(dest);
  https
    .get(url, (httpResponse: any) => {
      httpResponse.pipe(file);
      file.on("finish", function () {
        console.log("piping to file finished");
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on("error", (err: any) => {
      // Handle errors
      filesystem.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
};

export const getWidthAndHeight = (req: NextApiRequest) => {
  let width: string | number = getFromBody(req, "width") as string;
  let height: string | number = getFromBody(req, "height") as string;

  if (isNumber(width) && width < 3000) width = Math.abs(parseInt(width));
  else width = 512;

  if (isNumber(height) && height < 3000) height = Math.abs(parseInt(height));
  else height = 512;
  return { width, height };
};

export const addBearerPrefix = (token?: string) => {
  if (token?.startsWith("Bearer ")) return token;

  return `Bearer ${token || ""}`;
};



export const parseXml = (xml: string) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { trim: true }, (err: any, data: any) => {
      if (err) {
        return reject(err);
      }
      resolve(data as any);
    });
  });
};


export async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks: any = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export const formatMessage = (result: any) => {
  const message: any = {}
  if (typeof result === 'object') {
    for (let key in result) {
      if (!Array.isArray(result[key]) || !result[key].length) {
        continue
      }
      if (result[key].length === 1) {
        const val = result[key][0]
        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = result[key].map((item: any) => formatMessage(item))
      }
    }
  }
  return message
}


export const wait = (waitingTime: number = 1000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, waitingTime);
  });
};

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
