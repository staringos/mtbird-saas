import withAuthCheck from "@/middlewares/withAuthCheck";
import { refreshOfficalQrcode } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(refreshOfficalQrcode));

export default handler;
