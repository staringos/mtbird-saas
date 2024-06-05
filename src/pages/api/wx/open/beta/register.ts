import withAuthCheck from "@/middlewares/withAuthCheck";
import { fastRegisterWeApp } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(fastRegisterWeApp));

export default handler;
