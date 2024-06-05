import withAuthCheck from "@/middlewares/withAuthCheck";
import { updatePassword } from "lib/controllers/user";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.put(withAuthCheck(updatePassword));

export default handler;
