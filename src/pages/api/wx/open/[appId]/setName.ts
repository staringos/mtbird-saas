import withAuthCheck from "@/middlewares/withAuthCheck";
import { setMpNameController } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(setMpNameController));

export default handler;
