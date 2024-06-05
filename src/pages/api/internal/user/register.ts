import withAuthCheck from "@/middlewares/withAuthCheck";
import { registerFromDealer } from "lib/controllers/user";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(registerFromDealer);

export default handler;
