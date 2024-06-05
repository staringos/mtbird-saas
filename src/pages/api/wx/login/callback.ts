import { wechatLogin } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(wechatLogin);

export default handler;
