import withAuthCheck from "@/middlewares/withAuthCheck";
import { inviteMember } from "lib/controllers/team";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withAuthCheck(inviteMember));

export default handler;
