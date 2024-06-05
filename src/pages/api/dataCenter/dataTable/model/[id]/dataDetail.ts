import withAuthCheck from "@/middlewares/withAuthCheck";
import { getDataDetail } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(getDataDetail));

export default handler;
