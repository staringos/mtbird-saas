import nextConnect from "next-connect";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { orderDetailsController } from "lib/controllers/cashier";

const handler = nextConnect();

handler.get(withAuthCheck(orderDetailsController));

export default withAuthCheck(handler);
