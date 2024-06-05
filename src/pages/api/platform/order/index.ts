import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import { getPlatformOrderList } from "lib/controllers/platform";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(withPlatformAuthCheck(getPlatformOrderList));

export default handler;
