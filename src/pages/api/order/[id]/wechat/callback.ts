import { orderWecahtNotify } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(orderWecahtNotify);
handler.get(orderWecahtNotify);

export default handler;
