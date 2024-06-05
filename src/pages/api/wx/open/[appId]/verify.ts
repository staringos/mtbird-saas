import withAuthCheck from "@/middlewares/withAuthCheck";
import { verifyBetaMP } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(verifyBetaMP));

export default handler;
