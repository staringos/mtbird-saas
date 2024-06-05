import withAuthCheck from "@/middlewares/withAuthCheck";
import { addCompanyInfo, getCompanyInfos } from "lib/controllers/team";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(withAuthCheck(getCompanyInfos));
handler.post(withAuthCheck(addCompanyInfo));

export default handler;
