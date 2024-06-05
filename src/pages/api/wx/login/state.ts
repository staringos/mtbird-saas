import withAuthCheck from "@/middlewares/withAuthCheck";
import { wechatLoginStateCheck } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(wechatLoginStateCheck));

export default handler;
