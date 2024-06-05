import { wechatMPAuthorize, getWechatMPOpenId } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(wechatMPAuthorize);
handler.get(getWechatMPOpenId);

export default handler;
