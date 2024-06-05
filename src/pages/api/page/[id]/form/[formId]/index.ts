import withAuthCheck from "@/middlewares/withAuthCheck";
import { getForm, deleteFormData } from "lib/controllers/page";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getForm));
handler.delete(withAuthCheck(deleteFormData));

export default handler;
