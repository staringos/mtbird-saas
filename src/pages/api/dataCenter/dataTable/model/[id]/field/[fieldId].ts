import withAuthCheck from "@/middlewares/withAuthCheck";
import { deleteModalField, updateModalField } from "lib/controllers/dataCenter";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.delete(withAuthCheck(deleteModalField));
handler.put(withAuthCheck(updateModalField));

export default handler;
