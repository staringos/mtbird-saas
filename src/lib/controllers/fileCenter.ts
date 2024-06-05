import { OPERATION_SUCCESS } from "@/utils/messages";
import { generateKeys } from "@mtbird/core";
import { generateResponse } from "lib/response";
import { getFromBody } from "lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { uploadImage } from "./upload";

const request = require("request");
const fs = require("fs");
const path = require("path");

// 用以下方式可以监听图片下载成功与否
function downloadUrl(url: string, outputPath: string) {
  let outputStream = fs.createWriteStream(outputPath);
  return new Promise((resolve, reject) => {
    request(url).pipe(outputStream);
    outputStream.on("error", (error: any) => {
      reject(error);
    });
    outputStream.on("close", () => {
      console.log("downloadImage 文件下载完成");
      resolve(true);
    });
  });
}

export const fetchAndUploadController = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  const imageUrl = getFromBody(req, "imageUrl");
  const fileExtension = getFromBody(req, "fileExtension");
  const basePath = path.resolve("./.mtbird-cache");
  const fileName = `${generateKeys()}.${
    fileExtension ? fileExtension : ".jpg"
  }`;
  const outputPath = `${basePath}/${fileName}`;

  try {
    await downloadUrl(imageUrl, outputPath);
    const url = await uploadImage(outputPath, fileName);

    return res
      .status(200)
      .send(generateResponse(200, OPERATION_SUCCESS, { url }));
  } catch (e: any) {
    res.status(500).send(generateResponse(200, e.message));
  }
};
