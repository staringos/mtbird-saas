import withInternalAuth from "@/middlewares/withInternalAuth";
import { getOrderOverviewCtrl } from "lib/controllers/platform";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withInternalAuth(getOrderOverviewCtrl));

export default handler;
