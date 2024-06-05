import withAuthCheck from "@/middlewares/withAuthCheck";
import { setMPDoaminController } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(setMPDoaminController));

export default handler;
