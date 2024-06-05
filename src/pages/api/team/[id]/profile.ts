import withAuthCheck from "@/middlewares/withAuthCheck";
import { updateTeamProfile } from "lib/controllers/team";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.put(withAuthCheck(updateTeamProfile));

export default handler;
