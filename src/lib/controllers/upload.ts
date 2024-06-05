import qiniu from "qiniu";

const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.BUCKET;

export const getUploadAccessToken = (currentBucket?: string) => {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const policyParams: any = { scope: currentBucket || bucket };
  const putPolicy = new qiniu.rs.PutPolicy(policyParams);
  const uploadToken = putPolicy.uploadToken(mac);
  return { mac, token: uploadToken };
};

export const uploadImage = (
  filePath: string,
  key: string,
  bucket = process.env.BUCKET,
  rewrite = false
) => {
  // https://juejin.cn/post/7135230015641223205
  return new Promise((resolve, reject) => {
    const uploadToken = getUploadAccessToken(bucket);
    const config: any = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z2;
    // 是否使用https域名
    config.useHttpsDomain = true;
    // 上传是否使用cdn加速
    config.useCdnDomain = true;

    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    // 文件上传
    formUploader.putFile(
      uploadToken.token,
      key,
      filePath,
      putExtra,
      function (respErr, respBody, respInfo) {
        if (respErr) {
          throw respErr;
        }

        if (respInfo.statusCode == 200) {
          resolve(process.env.NEXT_PUBLIC_CDN_URL + "/" + respBody.key);
        } else {
          reject();
        }
      }
    );
  });
};
