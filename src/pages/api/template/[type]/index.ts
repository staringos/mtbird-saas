import { getTemplates } from "lib/controllers/template";
import nextConnect from "next-connect";
import withAuthCheck from "@/middlewares/withAuthCheck";

const handler = nextConnect();
handler.get(withAuthCheck(getTemplates));

export default handler;
