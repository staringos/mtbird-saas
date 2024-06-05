import withAuthCheck from "@/middlewares/withAuthCheck";
import { orderPay } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(orderPay));

export default handler;
