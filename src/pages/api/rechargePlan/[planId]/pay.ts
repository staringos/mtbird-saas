import nextConnect from "next-connect";
import { payController } from "lib/controllers/rechargePlan";
import withAuthCheck from "@/middlewares/withAuthCheck";

const handler = nextConnect();

handler.post(withAuthCheck(payController));

export default handler;
