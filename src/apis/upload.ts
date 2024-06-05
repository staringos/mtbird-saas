import request from "../utils/request";
import * as qiniu from "qiniu-js";
import { uuidv4 } from "@mtbird/core";

export const getToken = () => {
  return request.post("/upload/token");
};

export const uploadImages = async (files: any[]): Promise<string[]> => {
  const tokenResp = await getToken();
  const res: string[] = [];

  for (let i = 0; i < files.length; i++) {
    if (!files[i]) continue;
    res.push(
      await uploadImage(
        files[i]?.originFileObj || files[i],
        tokenResp.data.token.token as any
      )
    );
  }

  return res;
};

export const uploadImage = (file: any, token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const putExtra: any = {
      fname: "",
      params: {},
      mimeType: ["image/png", "image/jpeg", "image/gif", "video/mp4"],
    };
    const config = {
      useCdnDomain: true, //使用cdn加速
      forceDirect: true,
    };

    const keyArr = file.name?.split(".") || ["png"];
    const key = uuidv4(8) + "." + keyArr[keyArr.length - 1];

    // const options = {
    //   quality: 0.92,
    //   noCompressIfLarger: true
    // }

    // qiniu.compressImage(file, options).then(data => {
    // console.log("data.dist:", data)
    const observable = qiniu.upload(file as any, key, token, putExtra, config);
    const subscription = (observable.subscribe as any)(
      (process: any) => {},
      (error: any) => {
        console.log("error:", error);
        reject(error);
      },
      (e: any) => {
        resolve(process.env.NEXT_PUBLIC_CDN_URL + "/" + e.key);
      }
    );
    // })
  });

  // subscription.unsubscribe() // 上传取消
};
