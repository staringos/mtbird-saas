import withAuthCheck from "@/middlewares/withAuthCheck";
import { getWxMP } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getWxMP));

export default handler;
