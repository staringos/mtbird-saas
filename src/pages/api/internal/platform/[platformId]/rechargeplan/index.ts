import withInternalAuth from "@/middlewares/withInternalAuth";
import { createRechargePlanController, modifyRechargePlanController, getRechargePlanController } from "lib/controllers/platform";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withInternalAuth(createRechargePlanController));
handler.put(withInternalAuth(modifyRechargePlanController));
handler.get(withInternalAuth(getRechargePlanController));


export default handler;
