import withAuthCheck from "@/middlewares/withAuthCheck";
import { getMembers, deleteMembers } from "lib/controllers/team";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(withAuthCheck(getMembers));
handler.delete(withAuthCheck(deleteMembers));

export default handler;
