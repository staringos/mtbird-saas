import withAuthCheck from "@/middlewares/withAuthCheck";
import { getCompany } from "lib/controllers/company";
import nextConnect from "next-connect";

const handler = nextConnect();
handler.get(withAuthCheck(getCompany));

export default handler;
