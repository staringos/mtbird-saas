import withAuthCheck from "@/middlewares/withAuthCheck";
import { removeMember } from "lib/controllers/company";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.delete(withAuthCheck(removeMember));

export default handler;
