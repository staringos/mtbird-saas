import { wechatAuthorize } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(wechatAuthorize);

export default handler;
