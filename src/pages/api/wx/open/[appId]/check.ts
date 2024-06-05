import withAuthCheck from "@/middlewares/withAuthCheck";
import { processCheck } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(processCheck));

export default handler;
