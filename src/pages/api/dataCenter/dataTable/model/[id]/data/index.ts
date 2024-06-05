import withAuthCheck from "@/middlewares/withAuthCheck";
import { addData, getData } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(addData));
handler.get(withAuthCheck(getData, true));

export default handler;
