import nextConnect from "next-connect";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { cancelOrderController } from "lib/controllers/cashier";

const handler = nextConnect();

handler.get(withAuthCheck(cancelOrderController));

export default withAuthCheck(handler);
