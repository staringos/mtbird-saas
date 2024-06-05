import withAuthCheck from "@/middlewares/withAuthCheck";
import { addTemplate, deleteTemplate } from "lib/controllers/template";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(addTemplate));
handler.delete(withAuthCheck(deleteTemplate));

export default handler;
