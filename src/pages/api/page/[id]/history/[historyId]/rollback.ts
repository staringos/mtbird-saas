import withAuthCheck from "@/middlewares/withAuthCheck";
import { rollbackHistory } from "lib/controllers/page";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.put(withAuthCheck(rollbackHistory));
export default handler;
