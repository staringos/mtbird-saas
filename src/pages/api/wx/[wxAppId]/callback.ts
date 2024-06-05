import withAuthCheck from "@/middlewares/withAuthCheck";
import { mpMessageCallback } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(mpMessageCallback));

export default handler;
