import withAuthCheck from "@/middlewares/withAuthCheck";
import { wechatBind } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(wechatBind));

export default handler;
