import withAuthCheck from "@/middlewares/withAuthCheck";
import { setHomePage } from "lib/controllers/app";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(setHomePage));

export default handler;
