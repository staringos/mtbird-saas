import withAuthCheck from "@/middlewares/withAuthCheck";
import { takeOrder } from "lib/controllers/team";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(takeOrder));

export default handler;
