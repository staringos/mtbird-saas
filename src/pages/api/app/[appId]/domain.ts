import withAuthCheck from "@/middlewares/withAuthCheck";
import { bindDomain } from "lib/controllers/app";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(bindDomain));

export default handler;
