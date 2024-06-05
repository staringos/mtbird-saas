import withAuthCheck from "@/middlewares/withAuthCheck";
import { setApiDoaminController } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(setApiDoaminController));

export default handler;
