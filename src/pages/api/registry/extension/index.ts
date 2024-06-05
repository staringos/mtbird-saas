import withAuthCheck from "@/middlewares/withAuthCheck";
import { getExtensionList } from "lib/controllers/extension";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getExtensionList));

export default handler;
