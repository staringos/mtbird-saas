import withAuthCheck from "@/middlewares/withAuthCheck";
import { getExtensionManageList } from "lib/controllers/extension";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getExtensionManageList));

export default handler;
