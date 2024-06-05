import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import { confirmOrder } from "lib/controllers/platform";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(withPlatformAuthCheck(confirmOrder));

export default handler;
