import withAuthCheck from "@/middlewares/withAuthCheck";
import { getAllMemberCtrl } from "lib/controllers/company";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getAllMemberCtrl));

export default handler;
