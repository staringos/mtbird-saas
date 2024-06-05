import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import nextConnect from "next-connect";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { getRechargePlan } from "lib/controllers/rechargePlan";
import { createRechargePlanController } from "lib/controllers/platform";

const handler = nextConnect();

handler.get(getRechargePlan);
handler.post(withAuthCheck(createRechargePlanController))

export default handler;
