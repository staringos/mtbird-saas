import withPlatformAuthCheck from "middlewares/withPlatformAuthCheck";
import nextConnect from "next-connect";
import { getUserList } from "lib/controllers/platform";

const handler = nextConnect();

handler.get(withPlatformAuthCheck(getUserList));

export default handler;
