import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import nextConnect from "next-connect";
import { changeTemplatePrivate } from "lib/controllers/platform";

const handler = nextConnect();

handler.post(withPlatformAuthCheck(changeTemplatePrivate));

export default handler;
