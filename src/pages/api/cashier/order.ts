import nextConnect from "next-connect";
import withAuthCheck from "@/middlewares/withAuthCheck";
import { createOrderController } from "lib/controllers/cashier";

const handler = nextConnect();

handler.post(withAuthCheck(createOrderController));

export default withAuthCheck(handler);
