import withAuthCheck from "@/middlewares/withAuthCheck";
import { getMPAccessToken } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getMPAccessToken));

export default handler;
