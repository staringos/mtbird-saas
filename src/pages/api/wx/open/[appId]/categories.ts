import withAuthCheck from "@/middlewares/withAuthCheck";
import { addCategoryController } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.post(withAuthCheck(addCategoryController));

export default handler;
