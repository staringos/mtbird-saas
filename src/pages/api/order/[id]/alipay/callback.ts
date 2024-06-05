import withAuthCheck from "@/middlewares/withAuthCheck";
import { orderAlipayNotify } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(orderAlipayNotify);
handler.get(orderAlipayNotify);

export default handler;
