import withAuthCheck from "@/middlewares/withAuthCheck";
import { addTeam } from "lib/controllers/company";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(addTeam));

export default handler;
