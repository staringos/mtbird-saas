import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import nextConnect from "next-connect";
import { getTemplateList } from "lib/controllers/platform";

const handler = nextConnect();

handler.get(withPlatformAuthCheck(getTemplateList));

export default handler;
