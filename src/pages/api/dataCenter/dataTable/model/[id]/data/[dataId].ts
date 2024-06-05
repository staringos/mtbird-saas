import withAuthCheck from "@/middlewares/withAuthCheck";
import { deleteData, modifyData } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.delete(withAuthCheck(deleteData));
handler.put(withAuthCheck(modifyData));

export default handler;
