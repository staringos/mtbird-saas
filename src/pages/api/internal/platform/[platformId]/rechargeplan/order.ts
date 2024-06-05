import withInternalAuth from "@/middlewares/withInternalAuth";
import { getRechargePlanOrder } from "lib/controllers/platform";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withInternalAuth(getRechargePlanOrder));


export default handler;
