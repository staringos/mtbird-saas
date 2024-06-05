import withAuthCheck from "@/middlewares/withAuthCheck";
import { getOrderDetail } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(withAuthCheck(getOrderDetail));

export default handler;
