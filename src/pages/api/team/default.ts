import withAuthCheck from "@/middlewares/withAuthCheck";
import { getDefaultTeamController } from "lib/controllers/team";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getDefaultTeamController));

export default handler;
