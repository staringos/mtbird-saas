import CryptoJS from "crypto-js";

const API_KEY = process.env.WUNFEI_TTS_API_KEY;
const API_SECRET = process.env.WUNFEI_TTS_API_SECRET;

export const getAuthorization = (origin: string) => {
  const apiKey = API_KEY;
  const apiSecret = API_SECRET;
  const url = "wss://tts-api.xfyun.cn/v2/tts";
  const host = origin;
  const date = (new Date() as any).toGMTString();
  const algorithm = "hmac-sha256";
  const headers = "host date request-line";
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret!);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;

  return {
		url,
		date,
		host,
		authorization: Buffer.from(authorizationOrigin, 'utf8').toString('base64')
	};
};
