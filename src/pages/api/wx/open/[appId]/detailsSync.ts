import withAuthCheck from "@/middlewares/withAuthCheck";
import { syncMPDetails } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(syncMPDetails));

export default handler;
