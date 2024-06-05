import { getShowQrCode } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(getShowQrCode);

export default handler;
