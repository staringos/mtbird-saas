import withAuthCheck from "@/middlewares/withAuthCheck";
import { getAllCategoriesController } from "lib/controllers/wx";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getAllCategoriesController));

export default handler;
