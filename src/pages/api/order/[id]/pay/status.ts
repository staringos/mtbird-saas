import withAuthCheck from "@/middlewares/withAuthCheck";
import { getOrderPayStatus } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(getOrderPayStatus));

export default handler;
