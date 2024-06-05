import withAuthCheck from "@/middlewares/withAuthCheck";
import { updateModel, deleteModel } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.put(withAuthCheck(updateModel));
handler.delete(withAuthCheck(deleteModel));

export default handler;
