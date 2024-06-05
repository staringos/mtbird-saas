import withAuthCheck from "@/middlewares/withAuthCheck";
import { addHistory, getHistoryList } from "lib/controllers/page";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getHistoryList));
handler.post(withAuthCheck(addHistory));
export default handler;
