import withAuthCheck from "@/middlewares/withAuthCheck";
import { auditMpController } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(auditMpController));

export default handler;
