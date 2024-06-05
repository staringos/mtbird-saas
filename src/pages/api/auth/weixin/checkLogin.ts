import withAuthCheck from "@/middlewares/withAuthCheck";
import { checkLogin } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(checkLogin);

export default handler;
