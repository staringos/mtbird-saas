import withAuthCheck from "@/middlewares/withAuthCheck";
import { commitCode } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(commitCode));

export default handler;
