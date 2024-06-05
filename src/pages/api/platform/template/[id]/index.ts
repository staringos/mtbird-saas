import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import nextConnect from "next-connect";
import {
  getTemplateDetailsController,
  modifyTemplateController,
} from "lib/controllers/platform";

const handler = nextConnect();

handler.get(withPlatformAuthCheck(getTemplateDetailsController));
handler.put(withPlatformAuthCheck(modifyTemplateController));

export default handler;
