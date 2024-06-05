import withAuthCheck from "@/middlewares/withAuthCheck";
import { setAppDetails } from "lib/controllers/app";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.put(withAuthCheck(setAppDetails));

export default handler;
