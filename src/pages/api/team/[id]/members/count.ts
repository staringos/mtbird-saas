import withAuthCheck from "@/middlewares/withAuthCheck";
import { getMemberCount } from "lib/controllers/team";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(withAuthCheck(getMemberCount));

export default handler;
