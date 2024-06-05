import withAuthCheck from "@/middlewares/withAuthCheck";
import { closeOrder } from "lib/controllers/order";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(closeOrder));

export default handler;
