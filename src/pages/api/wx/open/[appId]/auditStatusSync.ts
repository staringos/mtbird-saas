import withAuthCheck from "@/middlewares/withAuthCheck";
import { syncAuditStatusController } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(syncAuditStatusController));

export default handler;
